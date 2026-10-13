var e={id:`lists`,h:{en:`Lists: many values in one variable`,hi:`Lists: ek variable mein kai values`},body:{en:`
<p>So far one variable held one value. But you manage many routers, many VLANs, many interfaces. A <b>list</b> is a single variable that holds <b>several values in order</b>. You write it with square brackets, and separate the items with commas. Think of the list of router IPs on a whiteboard, one under another.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
vlans = [10, 20, 30]
print(routers)
print(vlans)
print(type(routers))
print(len(routers))</pre>
<pre class="out">AUTO&gt; python3 l1.py
['10.99.0.1', '10.99.0.2', '10.99.0.3']
[10, 20, 30]
&lt;class 'list'&gt;
3</pre>
<p><code>len()</code> counts the items. A list can hold any type, strings and numbers alike, and may be empty: <code>down = []</code> is a list with nothing in it yet.</p>
<h3>Index: the position number</h3>
<p>Each item has an <b>index</b>, its position. Python counts from <b>0</b>: the first item is index 0, the second is 1. A negative index counts from the end: <code>-1</code> is the last item. A <b>slice</b> with a colon takes a part: <code>[1:3]</code> means from index 1 up to, but not including, 3.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="List indexes">
<rect x="20" y="20" width="140" height="46" rx="10" fill="#fde68a"/><text x="90" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.1"</text>
<rect x="175" y="20" width="140" height="46" rx="10" fill="#bae6fd"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.2"</text>
<rect x="330" y="20" width="140" height="46" rx="10" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.3"</text>
<rect x="485" y="20" width="140" height="46" rx="10" fill="#bbf7d0"/><text x="555" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.4"</text>
<text x="90" y="90" text-anchor="middle" class="svg-accent" font-size="13">[0]  [-4]</text>
<text x="245" y="90" text-anchor="middle" class="svg-accent" font-size="13">[1]  [-3]</text>
<text x="400" y="90" text-anchor="middle" class="svg-accent" font-size="13">[2]  [-2]</text>
<text x="555" y="90" text-anchor="middle" class="svg-accent" font-size="13">[3]  [-1]</text>
</svg><p class="cap">Each item has a positive index counting from 0 and a negative index counting from the end.</p></div>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(routers[0])
print(routers[2])
print(routers[-1])
print(routers[1:3])
print(len(routers))</pre>
<pre class="out">AUTO&gt; python3 l2.py
10.99.0.1
10.99.0.3
10.99.0.3
['10.99.0.2', '10.99.0.3']
3</pre>
<h3>Changing a list</h3>
<p>Lists can grow and shrink. <code>append()</code> adds one item at the end, <code>remove()</code> deletes the first matching item, and <code>in</code> asks whether a value is present. <code>sorted()</code> gives a sorted copy.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
routers.append("10.99.0.4")
print(routers)
print("10.99.0.9" in routers)
routers.remove("10.99.0.2")
print(routers)
print(len(routers))
print(sorted([30, 10, 20]))</pre>
<pre class="out">AUTO&gt; python3 l3.py
['10.99.0.1', '10.99.0.2', '10.99.0.3', '10.99.0.4']
False
['10.99.0.1', '10.99.0.3', '10.99.0.4']
3
[10, 20, 30]</pre>
<p>Notice that <code>append</code> and <code>remove</code> change the list itself (unlike string methods, which return a new string). Lists are <b>changeable</b>; strings are not.</p>
<h3>The index that does not exist</h3>
<p>Asking for a position beyond the end is an <b>IndexError</b>. The counting from 0 trips up everyone once:</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(routers[3])</pre>
<pre class="out">AUTO&gt; python3 l4.py
Traceback (most recent call last):
  File "l4.py", line 2, in &lt;module&gt;
    print(routers[3])
<span class="hl">IndexError: list index out of range</span></pre>
<p>The list has 3 items, so the valid indexes are 0, 1 and 2. A list of length n has valid indexes 0 to n - 1.</p>
<div class="eg"><p><b>Worked example.</b> Your VLAN list is <code>vlans = [10, 20, 30]</code>. <code>vlans[0]</code> is 10, <code>vlans[-1]</code> is 30, <code>20 in vlans</code> is <code>True</code>. After <code>vlans.append(40)</code>, <code>len(vlans)</code> is 4.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using index 1 for the first item (Python starts at 0), and using <code>len(routers)</code> itself as an index. The last valid index is <code>len(routers) - 1</code>, or simply <code>-1</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Typical question: for <code>x = ["a", "b", "c"]</code> what are <code>x[1]</code>, <code>x[-1]</code> and <code>x[0:2]</code>? Answers: <code>"b"</code>, <code>"c"</code>, <code>["a", "b"]</code>. Also know that <code>append</code> modifies the list in place and returns nothing useful.</p></div>
<div class="scn"><h4>Counting from one</h4><p>A script checked <code>routers[1]</code> expecting the first router and silently skipped router one for weeks. Nothing crashed, so nobody noticed until an audit showed one router had never been checked. The fix was a single character, <code>routers[0]</code>, and a loop so that no index was typed by hand again.</p><p><b>Lesson:</b> a wrong index may not crash; loops remove the need to pick indexes by hand.</p></div>
<div class="iv"><p class="q">"How do indexes work in a Python list?"</p><p>Indexes start at 0, so <code>x[0]</code> is the first item and <code>x[-1]</code> the last. A slice <code>x[a:b]</code> includes <code>a</code> but excludes <code>b</code>. Going past the end raises an IndexError. A list of length n has valid indexes 0 to n - 1.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A list is written in square brackets; items are separated by commas.</li>
<li>Indexes start at 0; -1 is the last item; a slice excludes its end.</li>
<li>append adds, remove deletes, in tests, len counts.</li>
<li>A missing position is an IndexError.</li>
</ul></div>
`,hi:`
<p>Ab tak ek variable mein ek value thi. Lekin aap kai routers, kai VLANs, kai interfaces sambhalte ho. <b>List</b> ek hi variable hai jo <b>order mein kai values</b> rakhta hai. Ise square brackets se likhte hain, aur items commas se alag hote hain. Whiteboard par router IPs ki list socho, ek ke neeche ek.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
vlans = [10, 20, 30]
print(routers)
print(vlans)
print(type(routers))
print(len(routers))</pre>
<pre class="out">AUTO&gt; python3 l1.py
['10.99.0.1', '10.99.0.2', '10.99.0.3']
[10, 20, 30]
&lt;class 'list'&gt;
3</pre>
<p><code>len()</code> items ginta hai. List mein koi bhi type ho sakta hai, strings aur numbers dono, aur woh khaali bhi ho sakti hai: <code>down = []</code> aisi list hai jisme abhi kuch nahi.</p>
<h3>Index: position number</h3>
<p>Har item ka ek <b>index</b> hota hai, uska position. Python <b>0</b> se ginta hai: pehla item index 0, doosra 1. Negative index end se ginta hai: <code>-1</code> aakhri item hai. Colon wala <b>slice</b> ek hissa leta hai: <code>[1:3]</code> ka matlab index 1 se 3 tak, 3 shaamil nahi.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="List indexes">
<rect x="20" y="20" width="140" height="46" rx="10" fill="#fde68a"/><text x="90" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.1"</text>
<rect x="175" y="20" width="140" height="46" rx="10" fill="#bae6fd"/><text x="245" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.2"</text>
<rect x="330" y="20" width="140" height="46" rx="10" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.3"</text>
<rect x="485" y="20" width="140" height="46" rx="10" fill="#bbf7d0"/><text x="555" y="48" text-anchor="middle" class="svg-ink" font-size="14">"10.99.0.4"</text>
<text x="90" y="90" text-anchor="middle" class="svg-accent" font-size="13">[0]  [-4]</text>
<text x="245" y="90" text-anchor="middle" class="svg-accent" font-size="13">[1]  [-3]</text>
<text x="400" y="90" text-anchor="middle" class="svg-accent" font-size="13">[2]  [-2]</text>
<text x="555" y="90" text-anchor="middle" class="svg-accent" font-size="13">[3]  [-1]</text>
</svg><p class="cap">Har item ka positive index (0 se) aur negative index (end se) hota hai.</p></div>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(routers[0])
print(routers[2])
print(routers[-1])
print(routers[1:3])
print(len(routers))</pre>
<pre class="out">AUTO&gt; python3 l2.py
10.99.0.1
10.99.0.3
10.99.0.3
['10.99.0.2', '10.99.0.3']
3</pre>
<h3>List badalna</h3>
<p>Lists badh aur ghat sakti hain. <code>append()</code> end mein ek item jodta hai, <code>remove()</code> pehla matching item delete karta hai, aur <code>in</code> poochta hai kya value maujood hai. <code>sorted()</code> sorted copy deta hai.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
routers.append("10.99.0.4")
print(routers)
print("10.99.0.9" in routers)
routers.remove("10.99.0.2")
print(routers)
print(len(routers))
print(sorted([30, 10, 20]))</pre>
<pre class="out">AUTO&gt; python3 l3.py
['10.99.0.1', '10.99.0.2', '10.99.0.3', '10.99.0.4']
False
['10.99.0.1', '10.99.0.3', '10.99.0.4']
3
[10, 20, 30]</pre>
<p>Dhyan do ki <code>append</code> aur <code>remove</code> list ko khud badalte hain (string methods ke ulta, jo nayi string return karte hain). Lists <b>changeable</b> hain; strings nahi.</p>
<h3>Woh index jo hai hi nahi</h3>
<p>End ke baad ka position maangna <b>IndexError</b> hai. 0 se ginti har kisi ko ek baar uljhaati hai:</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
print(routers[3])</pre>
<pre class="out">AUTO&gt; python3 l4.py
Traceback (most recent call last):
  File "l4.py", line 2, in &lt;module&gt;
    print(routers[3])
<span class="hl">IndexError: list index out of range</span></pre>
<p>List mein 3 items hain, isliye valid indexes 0, 1 aur 2 hain. n length ki list ke valid indexes 0 se n - 1 hote hain.</p>
<div class="eg"><p><b>Worked example.</b> Aapki VLAN list <code>vlans = [10, 20, 30]</code> hai. <code>vlans[0]</code> 10 hai, <code>vlans[-1]</code> 30, <code>20 in vlans</code> <code>True</code>. <code>vlans.append(40)</code> ke baad <code>len(vlans)</code> 4 hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Pehle item ke liye index 1 use karna (Python 0 se shuru hota hai), aur <code>len(routers)</code> ko hi index bana lena. Aakhri valid index <code>len(routers) - 1</code> hai, ya seedha <code>-1</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Typical sawaal: <code>x = ["a", "b", "c"]</code> ke liye <code>x[1]</code>, <code>x[-1]</code> aur <code>x[0:2]</code> kya hain? Jawab: <code>"b"</code>, <code>"c"</code>, <code>["a", "b"]</code>. Yeh bhi yaad rakho ki <code>append</code> list ko wahin badalta hai aur koi kaam ki value return nahi karta.</p></div>
<div class="scn"><h4>Ek se ginti</h4><p>Ek script ne <code>routers[1]</code> ko pehla router maan kar check kiya aur hafton tak router one ko chupchaap skip karta raha. Kuch crash nahi hua, isliye audit tak kisi ko pata nahi chala ki ek router kabhi check hi nahi hua. Fix ek character tha, <code>routers[0]</code>, aur ek loop taaki ab koi index haath se type na ho.</p><p><b>Lesson:</b> galat index crash nahi bhi kar sakta; loops haath se index chunne ki zaroorat hataate hain.</p></div>
<div class="iv"><p class="q">"Python list mein indexes kaise kaam karte hain?"</p><p>Indexes 0 se shuru hote hain, isliye <code>x[0]</code> pehla item aur <code>x[-1]</code> aakhri hai. Slice <code>x[a:b]</code> mein <code>a</code> shaamil aur <code>b</code> shaamil nahi. End ke baad jaane par IndexError aata hai. n length ki list ke valid indexes 0 se n - 1 hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List square brackets mein likhi jaati hai; items commas se alag hote hain.</li>
<li>Indexes 0 se shuru; -1 aakhri item; slice ka end shaamil nahi.</li>
<li>append jodta hai, remove hataata hai, in test karta hai, len ginta hai.</li>
<li>Maujood na hone wala position IndexError hai.</li>
</ul></div>
`}};export{e as default};