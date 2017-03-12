#include <stdio.h>
#include <string.h>
#include <math.h>
#define MAXN (2 << 20)

typedef unsigned long long b64;
typedef unsigned int b32;
const int r[4][4] = {
    { 7, 12, 17, 22},
    { 5,  9, 14, 20},
    { 4, 11, 16, 23},
    { 6, 10, 15, 21}
};

char s[MAXN + 1];
b32 data[MAXN];
b32 k[64];

void swap(unsigned char *a, unsigned char *b)
{
    unsigned char t = *a;
    *a = *b;
    *b = t;
}

b32 F(b32 X, b32 Y, b32 Z)
{
    return (X & Y) | (~X & Z);
}

b32 G(b32 X, b32 Y, b32 Z)
{
    return (X & Z) | (Y & ~Z);
}

b32 H(b32 X, b32 Y, b32 Z)
{
    return X ^ Y ^ Z;
}

b32 I(b32 X, b32 Y, b32 Z)
{
    return Y ^ (X | ~Z);
}

b32 (*func[4]) (b32, b32, b32) = {F, G, H, I};

b32 reverse32(b32 s)
{
    unsigned char c[4];
    memcpy(c, &s, sizeof(c));
    for (int i = 0, j = 4 - 1; i < j; ++i, --j)
        swap(&c[i], &c[j]);
    memcpy(&s, c, sizeof(c));
    return s;
}

b64 reverse64(b64 s)
{
    unsigned char c[8];
    memcpy(c, &s, sizeof(c));
    for (int i = 0, j = 8 - 1; i < j; ++i, --j)
        swap(&c[i], &c[j]);
    memcpy(&s, c, sizeof(c));
    return s;
}

b32 rotate_left(b32 x, int n)
{
    return (x << n) | (x >> (32 - n));
}

void work(b32 *A, b32 *B, b32 *C, b32 *D, int offset)
{
    b32 a = *A, b = *B, c = *C, d = *D;
    for (int i = 0; i < 64; ++i) {
        int num = (i < 16) ? i :
                  (i < 32) ? 5 * i + 1 :
                  (i < 48) ? 3 * i + 5 :
                             7 * i;
        num = offset + (num % 16);

        a = b + rotate_left(a + func[i / 16](b, c, d) + k[i] + data[num], r[i / 16][i % 4]);

        b32 tmp = d;
        d = c;
        c = b;
        b = a;
        a = tmp;
    }
    *A += a;
    *B += b;
    *C += c;
    *D += d;
}

void init()
{
    for (int i = 0; i < 64; ++i) {
        double t = sin((double)(i + 1));
        k[i] = (b32)(floor(fabs(t) * ((unsigned long long)1 << 32)));
    }
}

int main()
{
    init();
    memset(s, 0, sizeof(s));
    b64 len = 0;
    while (1) {
        int c = getchar();
        if (c == EOF)
            break;
        s[len++] = c;
    }
    s[len++] = 0x80;

    memcpy(data, s, sizeof(s));

    int blocks = len * 8 / 512 + (len % 64 <= 56 || len % 64 == 0) + (len % 64 > 56) * 2;

    len = reverse64(len * 8 - 8);
    data[blocks * 16 - 2] = reverse32((len & 0xffffffff00000000ll) >> 32);
    data[blocks * 16 - 1] = reverse32(len & 0xffffffff);

    b32 A = 0x67452301, B = 0xEFCDAB89, C = 0x98BADCFE, D = 0x10325476;
    for (int i = 0; i < blocks; ++i)
        work(&A, &B, &C, &D, i * 16);
    A = reverse32(A);
    B = reverse32(B);
    C = reverse32(C);
    D = reverse32(D);
    printf("%08x%08x%08x%08x\n", A, B, C, D);
    return 0;
}
