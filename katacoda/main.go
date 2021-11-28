package main

import (
	"encoding/csv"
	"log"
	"os"
	"regexp"
	"strings"
	"text/template"
)

func getMappings() ([][]string, error) {
	file, err := os.Open("katacoda/files.txt")
	defer file.Close()
	if err != nil {
		return nil, err
	}
	return csv.NewReader(file).ReadAll()
}

func main() {
	files, err := getMappings()
	if err != nil {
		log.Fatalf("unable to read input files: %w", err)
	}
	frontMatter := regexp.MustCompile(`(?s)\+\+\+.*\+\+\+`)
	docsLinks := regexp.MustCompile(` /docs/`)
	for _, mapping := range files {
		i := mapping[0]
		o := mapping[1]
		out, err := os.ReadFile(i)
		out = frontMatter.ReplaceAll(out, []byte(""))
		out = docsLinks.ReplaceAll(out, []byte(" https://buildpacks.io/docs/"))
		if err != nil {
			log.Fatalf("unable to read input file %s: %s", i, err)
		}
		t, err := template.New("example").Delims("<!--+", "+-->").Parse(strings.TrimSpace(string(out)))
		if err != nil {
			log.Fatalf("unable to parse file %s: %s", i, err)
		}
		f, err := os.Create(o)
		if err != nil {
			log.Fatalf("create file: ", err)
		}
		if err := t.Execute(f, []string{}); err != nil {
			log.Fatalf("unable to execute template: %s", err)
		}
	}
}
