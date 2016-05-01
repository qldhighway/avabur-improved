<?php

    $inputFile = $_SERVER['argv'][1];
    $outputFile = $_SERVER['argv'][2];
    $delimiter = '// ==/UserScript==';

    file_put_contents($outputFile, explode($delimiter, file_get_contents($inputFile))[0] . $delimiter);