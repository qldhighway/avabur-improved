<?php

    $inputFile = $_SERVER['argv'][1];
    $outputFile = $_SERVER['argv'][2];
    $endDelimiter = '// ==/UserScript==';
    $startDelimiter = '// ==UserScript==';

    $f = file_get_contents($inputFile);
    $f = explode($endDelimiter, file_get_contents($inputFile))[0] . $endDelimiter;
    $f = $startDelimiter . explode($startDelimiter, $f)[1];

    file_put_contents($outputFile, $f . "\n");