md5: md5.c
	gcc md5.c -o md5 -lm -O3 -Wall

clean:
	rm md5
