<?php

    $contents = file_get_contents($_SERVER['argv'][1]);

    function preg_find($pattern, $str) {
        $m = null;
        preg_match($pattern, $str, $m);

        return $m;
    }

    $is_dev = preg_find('~is_dev\s*=\s*(true|false)~i', $contents)[1] === 'true';
    $dev_hash = preg_find('~dev_hash\s*=\s*"([a-z0-9]+)"~i', $contents)[1];
    $version = preg_find('~@version\s*([^\s]+)~', $contents)[1];

    $output_version = $is_dev ? $dev_hash : $version;

    echo shell_exec('php "' . __DIR__ . DIRECTORY_SEPARATOR . 'manifest-generator.php" ' . $output_version);