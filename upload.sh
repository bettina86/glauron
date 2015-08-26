#!/bin/bash

rsync -rpltv --delete --exclude-from='no-upload.txt' ./ frozenfractal.com:/var/www/glauron.frozenfractal.com/embed/
