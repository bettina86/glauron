%.mp3: %.wav
	lame -b 128 $< $@

%.ogg: %.wav
	oggenc -q 1 $< -o $@

.PHONY: all
all: $(patsubst %.wav,%.mp3,$(wildcard *.wav)) $(patsubst %.wav,%.ogg,$(wildcard *.wav))
