


def f():
    for i in range(0, 10):
        yield i
        if i > 6:
            break


for i in f():
    print(i)