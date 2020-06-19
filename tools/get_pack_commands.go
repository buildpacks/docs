package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/buildpacks/pack/cmd"
	"github.com/spf13/cobra/doc"
)

const (
	cliDir     = "/docs/reference/pack/"
	outputPath = "../content" + cliDir
	indexFile  = `_index.md`

	gendocFrontmatterTemplate = `+++
title="%s"
+++
`
)

var filePrepender = func(filename string) string {
	name := filepath.Base(filename)
	name = strings.Replace(name, ".md", "", -1)
	return fmt.Sprintf(gendocFrontmatterTemplate, strings.Replace(name, "_", " ", -1))
}

var linkHandler = func(name string) string {
	base := strings.TrimSuffix(name, path.Ext(name))
	return cliDir + strings.ToLower(base) + "/"
}

func main() {
	packCmd, err := cmd.NewPackCommand()
	if err != nil {
		log.Fatal(err)
	}
	packCmd.DisableAutoGenTag = true

	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		if err := os.MkdirAll(outputPath, 0777); err != nil {
			log.Fatal(err)
		}
	}

	if _, err := os.Stat(filepath.Join(outputPath, indexFile)); os.IsNotExist(err) {
		if err := ioutil.WriteFile(filepath.Join(outputPath, indexFile), []byte(filePrepender("Pack CLI")), os.ModePerm); err != nil {
			log.Fatal(err)
		}
	}

	err = doc.GenMarkdownTreeCustom(packCmd, outputPath, filePrepender, linkHandler)
	if err != nil {
		log.Fatal(err)
	}
}
