package main

import (
	"encoding/csv"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"
)

var (
	commentType  = regexp.MustCompile(`file=(?P<filename>[\w-/\.]*)`)
	replacements = map[string]string{
		`[localhost:8080](http://localhost:8080)`: `[here](https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com)`,
	}
)

// A very syntactic approach to preprocessing text
// The "better" approach would be to parst the markdwn into some AST and
// manipulate the AST.  However the addition of katacoda <!--+ "{execute}" -->
// annotations do not lend themselves to any of the existing parsers.  Given the
// input
//
// <!-- test:exec;exit-code=1 -->
//```bash
//pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
//```
//<!--+"{{execute}}"+-->
//
// the `pandoc` AST is
//
// ,RawBlock (Format "html") "<!-- test:exec;exit-code=1 -->"
// ,Para [Code ("",[],[]) "bash pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack",RawInline (Format "html") "<!--+\"{{execute}}\"+-->"]
//
// and neither the gomarkdown or goldmark AST correctly capture this extended
// markdown format.  Neither golang parsers support Pandoc's
// `fenced_code_attributes` which could be used to work around this issue.
func preprocessText(input []byte) []byte {
	text := string(input)
	lines := strings.Split(text, "\n")
	output := preprocessor(lines)
	return []byte(strings.Join(output, "\n"))
}

func openCodeBlock(prv string, line string) (string, bool) {
	matches := commentType.FindStringSubmatch(prv)
	filename := commentType.SubexpIndex("filename")
	if len(matches) != 0 && filename != -1 {
		if strings.Contains(prv, "data-target=append") {
			return `<pre class="file" data-filename="` + matches[filename] + `" data-target="append">`, true
		}
		return `<pre class="file" data-filename="` + matches[filename] + `" data-target="replace">`, true
	}

	return line, false
}

// Defines a micro-sytax for fenced code blocks and frontmatter
//
// A fenced code block is $``` (where $ is the beginning of a line) followed by
// an optional language definition.  If the fenced code block is to replace or
// append to a katacoda file, then the line prior to the fence must contain
//   file=the/file/name
// an optional
//   data-target=append
// marks the fenced code block as appending to the named file rather than the
// default which is to replace it.
//
// Replace a file
//   <!-- test:file=ruby-buildpack/bin/build -->
//   ```bash
//   #!/usr/bin/env bash
//   ```
// Append to a file
//   <!-- test:file=ruby-buildpack/bin/build data-target=append -->
//   ```bash
//   #!/usr/bin/env bash
//   ```
// This works well with the existing test framework, eg: Test a file and mark it
// for replacement
//   <!-- test:file=ruby-buildpack/bin/detect -->
//   ```bash
//   #!/usr/bin/env bash
//   ````
func preprocessor(lines []string) []string {
	var (
		buf           []string
		closePreFlag  = false
		inFrontMatter = false
	)
	for _, s := range lines {

		// Perform any globally required replacments
		for key, value := range replacements {
			s = strings.ReplaceAll(s, key, value)
		}

		// Open code block
		if strings.HasPrefix(s, "```") && !closePreFlag {
			prv := buf[len(buf)-1]
			var codeblock string
			codeblock, closePreFlag = openCodeBlock(prv, s)
			buf = append(buf, codeblock)
			// Close code block
		} else if strings.HasPrefix(s, "```") && closePreFlag {
			buf = append(buf, "</pre>"+s[3:])
			closePreFlag = false
		} else if strings.HasPrefix(s, "+++") && !inFrontMatter {
			inFrontMatter = true
		} else if strings.HasPrefix(s, "+++") && inFrontMatter {
			inFrontMatter = false
		} else if inFrontMatter {
			fmatter := strings.Split(s, "=")
			if "title" == fmatter[0] {
				buf = append(buf, "# "+strings.Trim(fmatter[1], `"`))
			}
		} else {
			buf = append(buf, s)
		}
	}
	return buf
}

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
		parseError := err.(*csv.ParseError)
		log.Fatalf("unable to read input files, %s on line %d: %w", parseError.Err, parseError.Line, err)
	}
	docsLinks := regexp.MustCompile(`\(/docs/`)    // Links start with LPAREN eg: (foo)[/docs/...]
	docsFootnote := regexp.MustCompile(`: /docs/`) // References in footnotes eg: [foo]: /docs/...
	for _, mapping := range files {
		i := mapping[0]
		o := mapping[1]
		out, err := os.ReadFile(i)
		out = preprocessText(out)
		out = docsLinks.ReplaceAll(out, []byte("(https://buildpacks.io/docs/"))
		out = docsFootnote.ReplaceAll(out, []byte(": https://buildpacks.io/docs/"))
		if err != nil {
			log.Fatalf("unable to read input file %s: %s", i, err)
		}
		t, err := template.New("example").Delims("<!--+", "+-->").Parse(strings.TrimSpace(string(out)))
		if err != nil {
			log.Fatalf("unable to parse file %s: %s", i, err)
		}
		d := filepath.Dir(o)
		if err := os.MkdirAll(d, 0755); err != nil {
			log.Fatalf("unable to create output directory: %s", err)
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
