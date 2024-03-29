//解构数组

let point = [1,2,3];
//以前的写法：
let a = 1;
let b = 2;
let c = 3;
let x = point[0];
let y = point[1];
//现在
let [a,b,c] = [1,2,3]; //a 1, b 2, c 3
let [x,y] = point;

//默认值
[a=5, b=7] = [1]; //a 1, b 7

//交换变量 (不需要额外变量)
[a,b] = [b,a]; //a 7, b 1

//忽略不感兴趣的返回值
[a,,b] = f(); //a 1,b 3
function f(){
    return [1, 2, 3];
}

//剩余数组
//当解构一个数组时，可以使用剩余模式，将数组剩余部分赋值给一个变量
[a, ...b] = [1, 2, 3]; //a 1, b [2,3]
//注意：如果剩余元素右侧有逗号[a, ...b,]，会抛出 SyntaxError，因为剩余元素必须是数组的最后一个元素。



//解构对象
//对象的解构赋值与数组有一个不同，数组的元素是按次序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，才能取到正确的值。
var o = {p: 42, q: true};
var {p, q} = o; //p 42,q true

//无声明赋值
({a, b} = {a: 1, b: 2}); //通过解构，无需声明即可赋值一个变量。
//（...）表达式前面需要一个分号，否则会当成上一行函数执行。
// "()"的作用是使编译器区分解构语句中的{}和代码块中的{}，{a,b}是一个块而不是对象字面量，正如var {a, b} = {a: 1, b: 2}。


//给新变量名赋值
var {p: foo, q: bar} = o;  //foo 42, bar true

//默认值  当要提取的对象没有对应的属性，变量就被赋予默认值。
var {a = 10, b = 5} = {a: 3};
//函数参数默认值
function drawES2015Chart({size = 'big', cords = { x: 0, y: 0 } } = {}){}

//对象解构中的 Rest
//Rest 属性收集那些尚未被解构模式拾取的剩余可枚举属性键。
let {c, d, ...rest} = {c: 10, d: 20, e: 30, f: 40}; //c 10, d 20, rest { e: 30, f: 40 }

