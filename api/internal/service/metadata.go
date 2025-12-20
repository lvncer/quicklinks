package service

import (
	"log"
	"net/http"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Metadata struct {
	Title       string
	Description string
	Image       string
}

// FetchMetadata scrapes the URL to find OGP title, description, and image.
func FetchMetadata(targetURL string) (*Metadata, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, err
	}
	// Some sites (e.g. behind Cloudflare) may block obvious bot UAs from cloud IPs.
	// Use a browser-like UA to improve fetch success rates.
	req.Header.Set(
		"User-Agent",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
	)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "ja,en-US;q=0.9,en;q=0.8")

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Printf("failed to fetch metadata: status %d", res.StatusCode)
		return &Metadata{}, nil // Return empty metadata on non-200
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	meta := &Metadata{}

	// Helper to get meta content
	getContent := func(property string) string {
		return doc.Find("meta[property='"+property+"']").AttrOr("content", "")
	}
	getNameContent := func(name string) string {
		return doc.Find("meta[name='"+name+"']").AttrOr("content", "")
	}

	// Title
	meta.Title = getContent("og:title")
	if meta.Title == "" {
		meta.Title = doc.Find("title").Text()
	}

	// Description
	meta.Description = getContent("og:description")
	if meta.Description == "" {
		meta.Description = getNameContent("description")
	}

	// Image
	meta.Image = getContent("og:image")

	return meta, nil
}
