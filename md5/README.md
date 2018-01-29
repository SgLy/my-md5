## my MD5

`MD5` written in `C`.
Done this for fun.

### Advantages
None.

### Disadvantages
Countless.

### Requirement
- `GCC`
- `make`

### Compiling
```bash
> make
```

### Usage
```bash
> ./md5 < md5.c
44ee02083e0dc427af315e172d8e1b31
```

### Test
Tested with ~200,0000 random strings with length from 180 to 220.
Results checked with `python2-hashlib`
> Interestingly, they took nearly equal time to run, both ~3s (i7-4720HQ).
