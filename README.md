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
> ./md5
> 123456
e10adc3949ba59abbe56e057f20f883e
> Ctrl-D
>
```

### Test
Tested with ~200,0000 random strings with length from 180 to 220.
Results checked with `python2-hashlib`
> Interestingly, they took nearly equal time to run, both ~3s (i7-4720HQ).
