## Promise
#### Promise构造函数
Promise对象是一个构造函数，用来生成Promise实例。Promise有三种状态：pending/reslove/reject。pending就是未完成，resolve可以理解为成功，reject可以理解为拒绝。  

Promise构造函数接收一个函数作为参数，该函数的两个参数分别是resolve和reject，是两个函数。resolve函数的作用是将Promise对象从Pending变为Resolved。reject函数的作用是将Promise对象的状态由Pending变为Rejected。   
```js
let promise = new Promise(function(resolve, reject){
    //``````some code `````
    if(/*异步操作成功*/){
        resolve(value);
    }else{
        reject(error);
    }
});
```
#### then()
Promise实例生成以后，可以用then()分别指定Resolve状态和rejected状态的回调函数。then()接收两个回调函数作为参数。  
```js
promise.then(function (value) {
    //sucess
},function (value) {
    //failure
});
```
如果调用resolve()和reject()时带有参数，那么这些参数会被传递给回调函数。   
reject函数的参数一般为Error实例对象，表示抛出的错误。resolve的参数可以是一个值，也可以是另一个promise示例。 如下p2的resolve参数为p1，那么p1的状态会传递给p2，如果p1为pending，则p2等待p1状态改变，当p1的状态为resolved或rejected，p2立刻跟着改变。示例中1s后p2调用resolve方法，但此时p1状态还未改变，所以p2的回调函数等待p1状态改变，再过2s后，p1变为rejected，p2也变为rejected）。
```js
    let p = new Promise(function (resolve,reject) {
        setTimeout(()=>reject(new Error('fail')),3000);
    });
    let p2 = new Promise(function (resolve,reject) {
        setTimeout(()=>resolve(p),1000);
    });
    p2.then(result=>console.log(result));
    p2.catch(error=>console.log(error));
```
#### .catch()  
.catch()方法是then(null,rejection)的别名，仅仅是一个语法糖，用于制定发生错误时的回调函数。

Promise对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。即错误总是被下一个catch语句捕获。一般不要在then方法中定义Rejected状态的回调函数，而总是使用catch方法。 因为then(resolveHandler, rejectHandler) 这种形式中，rejectHandler 并不会捕获由 resolveHandler 引发的异常。
Node.js中有一个unhandledRejection事件，专门监听未捕获的Rejecetd错误。

#### Promise.all
```js
let p = Promise.all([p1,p2,p3]);
```
用于将多个Promise实例包装成一个新的Promise实例。接受一个数组作为参数,每一项分别是一个Promise实例（如果不是，就先调用Promise.resolve将参数转化为Promise实例）。   
p的状态有两种：   
1.当p1,p2,p3的状态都变为Fulfilled时, p的状态才变为Fulfilled。此时p1,p2,p3的返回值组成一个数组，传递给p的回调函数。   
2.只要p1,p2,p3有一个状态变为Rejected, p的状态就变为Rejected。此时第一个被Rejected的实例的返回值传递给p的回调函数。

#### Promise.race
```js
let p = Promise.race([p1,p2,p3]);
```
参数同上。 只要p1,p2,p3有一个率先改变状态，p的状态就跟着变。率先改变的Promise实例的返回值，会传递给p的回调函数。 

#### Promise.resolve()
用于将现有对象转化为Promise对象。
```js
Promise.resolve('foo') //等价于
new Promise(resolve => resolve('foo'))
```
如果希望得到一个Promise对象，比较方便的方法是直接调用此方法。 
```js
let p = Promise.resolve();
p.then(function(){
    //...
});
```

#### Promise.reject()
```js
let p = Promise.reject('出错了'); //等价于
let p = new Promise((resolve,reject)=>reject('foo'))
p.then(null,function(s){
    console.log(s);
});
```

### 实现Promise

首先要理解Promise规范： [Promise的实现与标准](https://www.jianshu.com/p/4d266538f364)  
resolve方法的方法体内部要把等待它resolve的回调函数都执行完（this.resolveCallback[]）（这也就是他为什么看起来是异步变成同步了，因为代码是一直往下执行的，pending状态的promise对象执行then方法，then方法题内部会给这个对象增加一个onResolved,onRejected的回调方法，等什么时候pengding状态改变了，然后继续再执行刚刚then里面增加的回调方法）  
思考：  
1. 为什么Promise能写成链式的，在.then之后还能接着.then？    
基于这一点可以判断出then方法return的是一个Promise
2. promise.then(onResolved, onRejected)里的这两项函数需要异步调用。  前提是了解：[js事件队列（为什么Promise.then的方法要加上setTimeout被延迟）](https://github.com/yangfeng1003/Knowledge/blob/master/js%E5%9F%BA%E7%A1%80/%E4%BB%BB%E5%8A%A1%E9%98%9F%E5%88%97.md) 
3. 每个Promise对象都可以在其上多次调用then方法，而每次调用then返回的Promise的状态取决于那一次调用then时传入参数的返回值。then()方法的x，即onResolved/onRejected的返回值。
调试时可以看到，每个pending状态的promise对象后面有then()的，都会放到回调数组里，数组长度为1.那么这么多链式的then()去哪了呢？因为每个then()都会返回一个新的promise对象，所以后面的then()都是在前一个then()的回调里，而不是第一个promise的回调数组中。那么什么时候能看到回调数组长度>1呢，是对一个promise添加多个then()的情况。例如：promise.then(...); promise.then(......);
})
4. 注意所有的resolve()都要用try/catch包裹
5. then()方法的参数是两个function，如果不是（比如.then(console.log(111)）,必须先转化为function。还有一个好处是可以实现then()值的穿透  
6. 不要写this，因为它是会变化的，应该在一开始定义一个变量保存this  



#### [Promise实现代码](https://github.com/yangfeng1003/Knowledge/tree/master/es6/code/Promise/MyPromise.js)

其他：
1. promise如何终止？假设Big ERROR的出现让我们完全没有必要运行后面所有的代码了，但链式调用的后面有catch或then，都不可避免的会进入某一个catch或then里面  

解决：可以在发生Big ERROR后return一个Promise，但这个Promise的函数什么也不做，这就意味着这个Promise将永远处于pending，后面的代码也就一直不会执行了
```js
new Promise(function(resolve, reject) {
  resolve(42)
})
  .then(function(value) {
    // "Big ERROR!!!"
    return new Promise(function(){})
  })
  .catch()
  .then()
  .catch()
  ```

  2. Promise链上返回的最后一个Promise出错了怎么办?

把方法done链到Promise链的最后，它就能够捕获前面未处理的错误，这其实跟在每个链后面加上catch没有太大的区别，只是它相当于提供了一个不会出错的catch链，我们可以这么实现done方法：
```js
Promise.prototype.done = function(){
  return this.catch(function(e) { // 此处一定要确保这个函数不能再出错
    console.error(e)
  })
}
```

面试题目（求输出结果）
```js
Promise.resolve(1)
.then((res) => {
console.log(res)
return 2
})
.catch((err) => {
return 3
})
.then((res) => {
console.log(res)
})

//输出
1
2
```
解释：promise 可以链式调用。提起链式调用我们通常会想到通过 return this 实现，不过 Promise 并不是这样实现的。promise 每次调用 .then 或者 .catch 都会返回一个新的 promise，从而实现了链式调用。
```js
Promise.resolve()
.then(() => {
return new Error('error!!!')
})
.then((res) => {
console.log('then: ', res)
})
.catch((err) => {
console.log('catch: ', err)
})

//输出
then:  Error: error!!!
```
解释：因为这里只是new Error，没有抛出异常，认为没有出错，所以还会执行then(),而且是then()对应的onResolved函数
如果换成throw new Error('error!!!')，则会输出 catch:  Error: error!!!。因为他会执行onRejected函数

```js
Promise.resolve(1)
.then(2)
.then(Promise.resolve(3))
.then(console.log)

//输出
1        //发生值的穿透
```
.then 或者 .catch 的参数期望是函数，传入非函数则会发生值穿透。如果题目换成.then(value=>Promise.resolve(3))，则最终会输出3
```js
Promise.resolve()
    .then(function success (res) {
        throw new Error('error')
    }, function fail1 (e) {
        console.error('fail1: ', e)
    })
    .catch(function fail2 (e) {
        console.error('fail2: ', e)
    })

//输出
fail2:  Error: error
```
解释：.then 的第二个参数：onRejected函数捕获不了第一个onResolved函数抛出的错误。发生的错误被下一个then（）捕获，这里catch（）相当于then(null,onRejected).
```js
process.nextTick(() => {
console.log('nextTick')
})
Promise.resolve()
.then(() => {
console.log('then')
})
setImmediate(() => {
console.log('setImmediate')
})
console.log('end')

//输出  （参考事件队列先后顺序）
end
nextTick
then
setImmediate
```
```js
async function async1(){
    console.log('async1 start')
    await async2()
    console.log('async1 end')
}
async function async2(){
    console.log('async2')
}
console.log('script start')
setTimeout(function(){
    console.log('setTimeout') 
},0)  
async1();
new Promise(function(resolve){
    console.log('promise1')
    resolve();
}).then(function(){
    console.log('promise2')
})
console.log('script end')
```
输出：
```js
script start
async1 start
async2
promise1
script end
promise2
async1 end
setTimeout
```
async 函数返回一个 Promise 对象，当函数执行的时候，一旦遇到 await就会先返回，等到触发的异步操作完成，再接着执行函数体内后面的语句。而await的返回值：返回 Promise 对象的处理结果。如果等待的不是 Promise 对象，则返回该值本身。  
执行到 async1 这个函数时，首先会打印出“async1 start”。执行到 await async2()，发现 async2 也是个 async 定义的函数，所以直接执行了“console.log('async2')”，同时async2返回了一个Promise，划重点：此时返回的Promise会被放入到回调队列中等待，await会让出线程（js是单线程还用我介绍吗），接下来就会跳出 async1函数 继续往下执行。注意之后执行到async2返回的promise对象是有一个resolve（）的，所以又是一个异步。因此在promise2之后输出async1 end
原文：https://www.cnblogs.com/wangfupeng1988/p/3994065.html

参考：  
https://www.jianshu.com/p/4d266538f364    Promise标准    
用es5实现promise代码：   
https://github.com/nzhl/promise  这个很好。里面有完整剖析 以及代码   
https://github.com/xieranmaya/blog/issues/3  
https://www.cnblogs.com/huansky/p/6064402.html  介绍了回调过程  
https://www.jianshu.com/p/c633a22f9e8c  详细介绍了then()每一步的递进  
https://blog.csdn.net/qq_34178990/article/details/81078906  整体代码  
https://juejin.im/post/5aab286a6fb9a028d3752621 代码验证  
https://github.com/promises-aplus/promises-tests/   代码验证  
> 代码验证 promises-tests ，方法很简单 
> npm i -g promises-aplus-tests  
> promises-aplus-tests Promise.js  
