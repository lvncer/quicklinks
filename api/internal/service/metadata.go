package service

import (
	"bytes"
	"context"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Metadata struct {
	Title       string
	Description string
	Image       string
	Source      string
	Blocked     bool
}

// FetchMetadata scrapes the URL to find OGP title, description, and image.
func FetchMetadata(targetURL string) (*Metadata, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	meta, status, err := fetchAndParse(ctx, client, targetURL)
	if err != nil {
		return nil, err
	}
	directChallenge := looksLikeBotChallenge(meta.Title)

	// If direct fetch likely hit bot protection (or no useful tags), try a proxy fetch.
	//
	// Note: Some sites behind Cloudflare may return "Just a moment..." pages to cloud IPs
	// (even with a browser UA), resulting in empty OG tags.
	if status != 200 || directChallenge || (meta.Image == "" && meta.Title == "" && meta.Description == "") {
		jinaURL := "https://r.jina.ai/" + targetURL
		fb, _, fbErr := fetchAndParse(ctx, client, jinaURL)
		if fbErr != nil {
			log.Printf("failed to fetch metadata via jina proxy: %v (target=%s)", fbErr, targetURL)
			meta.Source = "direct"
			meta.Blocked = sanitizeMetadata(meta, directChallenge)
			return meta, nil
		}
		fallbackChallenge := looksLikeBotChallenge(fb.Title)
		merged := mergePreferExisting(meta, fb)
		merged.Source = "jina"
		merged.Blocked = sanitizeMetadata(merged, directChallenge || fallbackChallenge)
		return merged, nil
	}

	meta.Source = "direct"
	meta.Blocked = sanitizeMetadata(meta, false)
	return meta, nil
}

func looksLikeBotChallenge(title string) bool {
	t := strings.ToLower(strings.TrimSpace(title))
	return strings.Contains(t, "just a moment") || strings.Contains(t, "attention required") || strings.Contains(t, "cloudflare")
}

func mergePreferExisting(primary, fallback *Metadata) *Metadata {
	// Treat bot-challenge content as missing to avoid contaminating UI/DB with "Just a moment...".
	primaryTitle := primary.Title
	primaryDesc := primary.Description
	if looksLikeBotChallenge(primaryTitle) {
		primaryTitle = ""
		primaryDesc = ""
	}
	fallbackTitle := fallback.Title
	fallbackDesc := fallback.Description
	if looksLikeBotChallenge(fallbackTitle) {
		fallbackTitle = ""
		fallbackDesc = ""
	}

	out := &Metadata{
		Title:       primaryTitle,
		Description: primaryDesc,
		Image:       primary.Image,
		Source:      primary.Source,
	}
	if out.Title == "" {
		out.Title = fallbackTitle
	}
	if out.Description == "" {
		out.Description = fallbackDesc
	}
	if out.Image == "" {
		out.Image = fallback.Image
	}
	return out
}

func sanitizeMetadata(m *Metadata, hadChallenge bool) (blocked bool) {
	if m == nil {
		return false
	}
	// If we still have a bot-challenge title, drop title/description (avoid contamination).
	if looksLikeBotChallenge(m.Title) {
		m.Title = ""
		m.Description = ""
		blocked = true
		hadChallenge = true
	}

	m.Title = strings.TrimSpace(m.Title)
	m.Description = strings.TrimSpace(m.Description)
	m.Image = strings.TrimSpace(m.Image)

	if len(m.Description) > 2000 {
		m.Description = m.Description[:2000]
	}

	// Image must be an absolute http(s) URL. Otherwise, drop it.
	if m.Image != "" {
		u, err := url.Parse(m.Image)
		if err != nil || u == nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			m.Image = ""
		}
	}

	// If we detected a bot challenge earlier but ended up with empty title+description,
	// mark it as blocked so clients can show user-facing feedback.
	if !blocked && hadChallenge && m.Title == "" && m.Description == "" {
		blocked = true
	}

	return blocked
}

func fetchAndParse(ctx context.Context, client *http.Client, target string) (*Metadata, int, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", target, nil)
	if err != nil {
		return nil, 0, err
	}
	applyBrowserHeaders(req)

	res, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 2<<20)) // 2MB cap
	if err != nil {
		return nil, res.StatusCode, err
	}

	m := &Metadata{}

	// Try HTML OG tags first.
	if doc, err := goquery.NewDocumentFromReader(bytes.NewReader(body)); err == nil {
		// Helpers: sites sometimes use `property` or `name`.
		getMeta := func(key string) string {
			keyEsc := strings.ReplaceAll(key, "'", "\\'")
			if v := strings.TrimSpace(doc.Find("meta[property='"+keyEsc+"']").AttrOr("content", "")); v != "" {
				return v
			}
			if v := strings.TrimSpace(doc.Find("meta[name='"+keyEsc+"']").AttrOr("content", "")); v != "" {
				return v
			}
			return ""
		}

		// Title
		m.Title = firstNonEmpty(
			getMeta("og:title"),
			getMeta("twitter:title"),
			strings.TrimSpace(doc.Find("title").Text()),
		)
		// Description
		m.Description = firstNonEmpty(
			getMeta("og:description"),
			getMeta("twitter:description"),
			getMeta("description"),
		)
		// Image
		m.Image = firstNonEmpty(
			getMeta("og:image"),
			getMeta("og:image:url"),
			getMeta("twitter:image"),
			getMeta("twitter:image:src"),
		)

		// Resolve relative image URLs if any.
		if m.Image != "" {
			m.Image = resolveMaybeRelativeURL(target, m.Image)
		}
	}

	// If still missing image, try extracting from jina's Markdown/plain content.
	if m.Image == "" {
		text := string(body)
		m.Title = firstNonEmpty(m.Title, parseJinaTitle(text))
		m.Image = firstNonEmpty(m.Image, extractFirstImageURL(text))
	}

	return m, res.StatusCode, nil
}

func applyBrowserHeaders(req *http.Request) {
	// Some sites (e.g. behind Cloudflare) may block obvious bot UAs from cloud IPs.
	// Use a browser-like UA to improve fetch success rates.
	req.Header.Set(
		"User-Agent",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
	)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "ja,en-US;q=0.9,en;q=0.8")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		v = strings.TrimSpace(v)
		if v != "" {
			return v
		}
	}
	return ""
}

func resolveMaybeRelativeURL(baseStr, u string) string {
	u = strings.TrimSpace(u)
	if u == "" {
		return ""
	}
	parsed, err := url.Parse(u)
	if err == nil && parsed.IsAbs() {
		return u
	}
	base, err := url.Parse(baseStr)
	if err != nil || base == nil {
		return u
	}
	if parsed == nil {
		parsed, _ = url.Parse(u)
	}
	if parsed == nil {
		return u
	}
	return base.ResolveReference(parsed).String()
}

func parseJinaTitle(text string) string {
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Title:") {
			return strings.TrimSpace(strings.TrimPrefix(line, "Title:"))
		}
	}
	return ""
}

var (
	reMarkdownImage = regexp.MustCompile(`!\[[^\]]*\]\((https?://[^)\s]+)\)`)
	reImageURL      = regexp.MustCompile(`https?://[^\s)]+?\.(?:png|jpe?g|webp)(?:\?[^\s)]*)?`)
)

func extractFirstImageURL(text string) string {
	if m := reMarkdownImage.FindStringSubmatch(text); len(m) == 2 {
		return strings.TrimRight(m[1], ")")
	}
	if m := reImageURL.FindString(text); m != "" {
		return strings.TrimRight(m, ")")
	}
	return ""
}
