var e={id:`strings-and-integers`,h:{en:`Strings and integers: text versus numbers`,hi:`Strings aur integers: text versus numbers`},body:{en:`
<p>A phone book lists "Asha 9876" and a calculator adds 9876 + 1. Both show digits, but you would never add one to a phone number. Python draws the same line. Every value has a <b>type</b>, and the type decides what you are allowed to do with it. Two types do most of the work in network scripts: <b>str</b> (text) and <b>int</b> (whole numbers).</p>
<table class="cmp"><thead><tr><th>Type</th><th>Meaning</th><th>Examples</th></tr></thead><tbody>
<tr><td><code>str</code></td><td>Text, always in quotes</td><td><code>"R1"</code>, <code>"10.99.0.1"</code>, <code>"Gi0/1"</code></td></tr>
<tr><td><code>int</code></td><td>Whole number, no quotes</td><td><code>10</code>, <code>4094</code>, <code>-1</code></td></tr>
<tr><td><code>float</code></td><td>Number with a decimal point</td><td><code>2.5</code>, <code>99.9</code></td></tr>
<tr><td><code>bool</code></td><td>Yes or no</td><td><code>True</code>, <code>False</code></td></tr>
</tbody></table>
<p>The built-in <code>type()</code> tells you the type of anything. Notice that an IP address in quotes is text, not a number, and that <code>"10"</code> in quotes is also text:</p>
<pre class="code">print(type("10.99.0.1"))
print(type("10"))
print(type(10))
print(type(2.5))
print(type(True))</pre>
<pre class="out">AUTO&gt; python3 s1.py
&lt;class 'str'&gt;
&lt;class 'str'&gt;
&lt;class 'int'&gt;
&lt;class 'float'&gt;
&lt;class 'bool'&gt;</pre>
<h3>What + does depends on the type</h3>
<p>With numbers, <code>+</code> adds. With strings, <code>+</code> <b>joins</b> them end to end. The <code>*</code> sign repeats a string, which is perfect for drawing a line in a report.</p>
<pre class="code">print(10 + 5)
print("10" + "5")
print("Gi" + "0/1")
print("-" * 20)
print("ab" * 3)</pre>
<pre class="out">AUTO&gt; python3 s2.py
15
105
Gi0/1
--------------------
ababab</pre>
<p><code>"10" + "5"</code> gave <code>105</code> (text joined), not 15. That is the whole difference between str and int in one line.</p>
<h3>Converting between types</h3>
<p>Output from routers always arrives as text. To do maths on a number that arrived as text, convert it with <code>int()</code>. To put a number inside text, convert it with <code>str()</code>.</p>
<pre class="code">vlan_text = "10"
print(int(vlan_text) + 5)
vlan = 10
print("VLAN " + str(vlan))
print(float("2.5") + 1)</pre>
<pre class="out">AUTO&gt; python3 s3.py
15
VLAN 10
3.5</pre>
<p>Mixing the two types without converting is an error. Python refuses to guess:</p>
<pre class="code">vlan = 10
print("VLAN " + vlan)</pre>
<pre class="out">AUTO&gt; python3 s4.py
Traceback (most recent call last):
  File "s4.py", line 2, in &lt;module&gt;
    print("VLAN " + vlan)
<span class="hl">TypeError: can only concatenate str (not "int") to str</span></pre>
<p><b>TypeError: can only concatenate str (not "int") to str</b> says: you tried to join text with a number. Fix it with <code>str(vlan)</code>, or, even better, with an f-string (chapter 6).</p>
<h3>Looking inside a string</h3>
<p>A string is a row of characters. <code>len()</code> counts them. A number in square brackets picks one character, counting from <b>0</b>; a negative number counts from the end; two numbers with a colon take a slice (the end position is not included).</p>
<pre class="code">name = "PUN-CORE-01"
print(len(name))
print(name[0])
print(name[-1])
print(name[0:3])</pre>
<pre class="out">AUTO&gt; python3 s5.py
11
P
1
PUN</pre>
<div class="eg"><p><b>Worked example.</b> A hostname is <code>PUN-CORE-01</code>. The first three characters, <code>name[0:3]</code>, give the city code <code>PUN</code>. Scripts often use a name pattern like this to decide which site a device belongs to.</p></div>
<div class="warn"><p><b>Common mistake.</b> Believing that <code>"10"</code> and <code>10</code> are the same. They print the same but behave differently: <code>"10" + "5"</code> is <code>105</code>, while <code>10 + 5</code> is <code>15</code>. Values read from show output or files are text until you convert them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Typical question: "What does <code>"5" * 3</code> print?" Answer <code>555</code> (a string repeated). And "<code>5 * 3</code>" is <code>15</code>. Know that <code>int("abc")</code> raises a ValueError.</p></div>
<div class="scn"><h4>Adding up port counts</h4><p>A script read "24" and "48" from two outputs and printed 2448 as the total number of ports. The engineer had joined two strings. After converting each with <code>int()</code> the total became 72. Values that look like numbers are still text until you convert them.</p><p><b>Lesson:</b> convert text to int before doing maths on it.</p></div>
<div class="iv"><p class="q">"What is the difference between "10" and 10 in Python?"</p><p><code>"10"</code> is a string (text); <code>10</code> is an integer. Strings are joined with <code>+</code> and repeated with <code>*</code>; integers are added and multiplied. Convert with <code>int()</code> and <code>str()</code>. Mixing them with <code>+</code> raises a TypeError.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>str is text in quotes; int is a whole number; type() tells you which.</li>
<li>+ adds numbers but joins strings; * repeats a string.</li>
<li>Use int() and str() to convert; mixing without converting is a TypeError.</li>
<li>len(), [0], [-1] and [0:3] look inside a string; counting starts at 0.</li>
</ul></div>
`,hi:`
<p>Phone book mein "Asha 9876" likha hota hai aur calculator 9876 + 1 jodta hai. Dono digits dikhate hain, lekin aap phone number mein ek kabhi nahi jodoge. Python bhi yahi line kheenchta hai. Har value ka ek <b>type</b> hota hai, aur type decide karta hai ki aap uske saath kya kar sakte ho. Network scripts mein do types zyada kaam karte hain: <b>str</b> (text) aur <b>int</b> (poore numbers).</p>
<table class="cmp"><thead><tr><th>Type</th><th>Matlab</th><th>Examples</th></tr></thead><tbody>
<tr><td><code>str</code></td><td>Text, hamesha quotes mein</td><td><code>"R1"</code>, <code>"10.99.0.1"</code>, <code>"Gi0/1"</code></td></tr>
<tr><td><code>int</code></td><td>Poora number, bina quotes</td><td><code>10</code>, <code>4094</code>, <code>-1</code></td></tr>
<tr><td><code>float</code></td><td>Decimal point wala number</td><td><code>2.5</code>, <code>99.9</code></td></tr>
<tr><td><code>bool</code></td><td>Haan ya na</td><td><code>True</code>, <code>False</code></td></tr>
</tbody></table>
<p>Built-in <code>type()</code> kisi bhi cheez ka type batata hai. Dhyan do ki quotes mein IP address text hai, number nahi, aur quotes mein <code>"10"</code> bhi text hai:</p>
<pre class="code">print(type("10.99.0.1"))
print(type("10"))
print(type(10))
print(type(2.5))
print(type(True))</pre>
<pre class="out">AUTO&gt; python3 s1.py
&lt;class 'str'&gt;
&lt;class 'str'&gt;
&lt;class 'int'&gt;
&lt;class 'float'&gt;
&lt;class 'bool'&gt;</pre>
<h3>+ kya karta hai yeh type par depend karta hai</h3>
<p>Numbers ke saath <code>+</code> jodta (add) hai. Strings ke saath <code>+</code> unhe end-to-end <b>chipkata</b> hai. <code>*</code> sign string ko repeat karta hai, jo report mein line kheenchne ke liye perfect hai.</p>
<pre class="code">print(10 + 5)
print("10" + "5")
print("Gi" + "0/1")
print("-" * 20)
print("ab" * 3)</pre>
<pre class="out">AUTO&gt; python3 s2.py
15
105
Gi0/1
--------------------
ababab</pre>
<p><code>"10" + "5"</code> ne <code>105</code> diya (text chipka), 15 nahi. Str aur int ka poora fark ek line mein yahi hai.</p>
<h3>Types ke beech conversion</h3>
<p>Routers ka output hamesha text ki tarah aata hai. Text ki tarah aaye number par maths karne ke liye use <code>int()</code> se convert karo. Number ko text ke andar rakhne ke liye <code>str()</code> se convert karo.</p>
<pre class="code">vlan_text = "10"
print(int(vlan_text) + 5)
vlan = 10
print("VLAN " + str(vlan))
print(float("2.5") + 1)</pre>
<pre class="out">AUTO&gt; python3 s3.py
15
VLAN 10
3.5</pre>
<p>Convert kiye bina dono types ko milana error hai. Python andaaza nahi lagata:</p>
<pre class="code">vlan = 10
print("VLAN " + vlan)</pre>
<pre class="out">AUTO&gt; python3 s4.py
Traceback (most recent call last):
  File "s4.py", line 2, in &lt;module&gt;
    print("VLAN " + vlan)
<span class="hl">TypeError: can only concatenate str (not "int") to str</span></pre>
<p><b>TypeError: can only concatenate str (not "int") to str</b> kehta hai: aapne text ko number se jodne ki koshish ki. Fix <code>str(vlan)</code> se karo, ya, aur behtar, f-string se (chapter 6).</p>
<h3>String ke andar jhaankna</h3>
<p>String characters ki ek line hai. <code>len()</code> unhe ginta hai. Square brackets mein number ek character chunta hai, <b>0</b> se ginte hue; negative number end se ginta hai; colon ke saath do numbers slice dete hain (end position shaamil nahi).</p>
<pre class="code">name = "PUN-CORE-01"
print(len(name))
print(name[0])
print(name[-1])
print(name[0:3])</pre>
<pre class="out">AUTO&gt; python3 s5.py
11
P
1
PUN</pre>
<div class="eg"><p><b>Worked example.</b> Hostname <code>PUN-CORE-01</code> hai. Pehle teen characters, <code>name[0:3]</code>, city code <code>PUN</code> dete hain. Scripts aksar aise name pattern se decide karte hain ki device kis site ka hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki <code>"10"</code> aur <code>10</code> same hain. Print same hote hain lekin behave alag karte hain: <code>"10" + "5"</code> <code>105</code> hai, jabki <code>10 + 5</code> <code>15</code> hai. Show output ya files se padhi values tab tak text hain jab tak convert na karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Typical sawaal: "<code>"5" * 3</code> kya print karta hai?" Jawab <code>555</code> (string repeat hui). Aur "<code>5 * 3</code>" <code>15</code> hai. Yaad rakho <code>int("abc")</code> ValueError deta hai.</p></div>
<div class="scn"><h4>Port counts jodna</h4><p>Ek script ne do outputs se "24" aur "48" padhe aur total ports 2448 print kiye. Engineer ne do strings jodi thi. Har ek ko <code>int()</code> se convert karne ke baad total 72 hua. Numbers jaisi dikhne wali values tab tak text hain jab tak convert na karo.</p><p><b>Lesson:</b> maths se pehle text ko int mein convert karo.</p></div>
<div class="iv"><p class="q">"Python mein "10" aur 10 mein kya fark hai?"</p><p><code>"10"</code> string (text) hai; <code>10</code> integer hai. Strings <code>+</code> se jodi aur <code>*</code> se repeat ki jaati hain; integers add aur multiply hote hain. <code>int()</code> aur <code>str()</code> se convert karo. <code>+</code> se dono ko milane par TypeError aata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>str quotes mein text hai; int poora number hai; type() batata hai kaunsa.</li>
<li>+ numbers add karta hai lekin strings jodta hai; * string repeat karta hai.</li>
<li>int() aur str() se convert karo; bina convert kiye milana TypeError hai.</li>
<li>len(), [0], [-1] aur [0:3] string ke andar dekhte hain; ginti 0 se shuru.</li>
</ul></div>
`}};export{e as default};