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
	req.Header.Set("User-Agent", "QuickLinks-Bot/1.0")

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
