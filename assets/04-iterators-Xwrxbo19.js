var e={id:`iterators`,h:{en:`Iterables, iterators and what a for loop really does`,hi:`Iterables, iterators aur for loop asal mein kya karta hai`},body:{en:`
<p><b>The idea of this chapter:</b> you have written <code>for port in ports:</code> many times. This chapter lifts the lid and shows the small protocol underneath. Once you see it, generators stop being strange, and the bugs in Lab 2 become easy to predict.</p>

<h3>Analogy: the token machine at a bank</h3>
<p>A bank has a queue. The <b>queue itself</b> is the <b>iterable</b>: you can ask it for a token machine. The <b>token machine</b> is the <b>iterator</b>: each time you press the button it gives you the next number and remembers where it is. When the numbers run out it says "no more tokens". Ask the queue for a second token machine and you get a fresh one that starts from the beginning. Press the first machine again after it ran out, and you still get nothing.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="iter() turns an iterable into an iterator; next() pulls items until StopIteration">
<rect x="20" y="40" width="150" height="62" rx="10" fill="#bae6fd"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="13">iterable</text><text x="95" y="88" text-anchor="middle" class="svg-muted" font-size="11">list, dict, file, range</text>
<rect x="250" y="40" width="150" height="62" rx="10" fill="#fde68a"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">iterator</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">remembers its place</text>
<rect x="480" y="40" width="140" height="62" rx="10" fill="#bbf7d0"/><text x="550" y="68" text-anchor="middle" class="svg-ink" font-size="13">item</text><text x="550" y="88" text-anchor="middle" class="svg-muted" font-size="11">one at a time</text>
<line x1="170" y1="71" x2="250" y2="71" stroke="#64748b" stroke-width="2"/><text x="210" y="62" text-anchor="middle" class="svg-accent" font-size="12">iter()</text>
<line x1="400" y1="71" x2="480" y2="71" stroke="#64748b" stroke-width="2"/><text x="440" y="62" text-anchor="middle" class="svg-accent" font-size="12">next()</text>
<text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">when nothing is left, next() raises StopIteration and the for loop ends quietly</text>
</svg><p class="cap">iter() makes the machine, next() presses the button.</p></div>

<h3>iter(), next() and StopIteration</h3>
<pre class="code">ports = ["Gi0/1", "Gi0/2", "Gi0/3"]
it = iter(ports)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration: the belt is empty")
print(next(it, "no more"))</pre>
<pre class="out">AUTO01$ python3 c4.py
Gi0/1
Gi0/2
Gi0/3
<span class="hl">StopIteration: the belt is empty</span>
no more</pre>
<p><code>iter(ports)</code> asks the list for its token machine. Each <code>next(it)</code> returns the next port. When the three ports are used up, <code>next</code> raises the exception <code>StopIteration</code>, which is not an error but a signal: "finished". Giving <code>next</code> a second argument returns that default instead of raising, which is how the lab will stop early later.</p>

<h3>A for loop is just this, written for you</h3>
<p>The loop below does exactly what <code>for p in ports</code> does. Python calls <code>iter()</code> once, calls <code>next()</code> again and again, and quietly stops when it sees <code>StopIteration</code>.</p>
<pre class="code">it = iter(ports)
while True:
    try:
        p = next(it)
    except StopIteration:
        break
    print("loop body:", p)</pre>
<pre class="out">AUTO01$ python3 c4.py
loop body: Gi0/1
loop body: Gi0/2
<span class="hl">loop body: Gi0/3</span></pre>
<p>That small protocol is the reason so many things work in a <code>for</code> loop: lists, tuples, dictionaries, strings, ranges, files, and the generators you will write next.</p>

<h3>Iterable versus iterator: the one-shot rule</h3>
<p>A <b>list</b> is an iterable that hands out a fresh iterator each time, so you can loop over it as often as you like. Many iterators are <b>one-shot</b>: once consumed, they stay empty.</p>
<pre class="code">e = enumerate(ports, start=1)
print(list(e))
print(list(e))
z = zip(ports, ["up", "down", "up"])
print(dict(z))
print(dict(z))
r = range(3)
print(list(r), list(r), len(r))</pre>
<pre class="out">AUTO01$ python3 c4.py
[(1, 'Gi0/1'), (2, 'Gi0/2'), (3, 'Gi0/3')]
<span class="hl">[]</span>
{'Gi0/1': 'up', 'Gi0/2': 'down', 'Gi0/3': 'up'}
<span class="hl">{}</span>
[0, 1, 2] [0, 1, 2] 3</pre>
<p><code>enumerate</code> and <code>zip</code> are iterators: the second pass finds nothing left. <code>range</code> is an iterable that can be walked repeatedly and even has a length. <code>map</code> and <code>reversed</code> behave like <code>enumerate</code>. The same rule applies to generators, and it is the cause of the most common bug in this module.</p>

<h3>Files are iterables too</h3>
<p>A file read in a <code>for</code> loop gives one line at a time and never loads the whole file. You can leave the loop early with <code>break</code>; the file simply stays where it was.</p>
<pre class="code">with open("router.log") as f:
    n = 0
    for line in f:
        n += 1
        if n == 2:
            break
    print(n, line.rstrip())

g = iter(open("router.log"))
print(next(g).rstrip())
print(next(g).rstrip())</pre>
<pre class="out">AUTO01$ python3 c4.py
<span class="hl">2 Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</pre>
<div class="note"><p><b>Lab note.</b> In real Python you can call <code>next(f)</code> straight on an open file. The lab's file object supports <code>for</code> loops and <code>iter(f)</code> but not a bare <code>next(f)</code>, so the listing uses <code>iter()</code> first. That form works in both places.</p></div>

<h3>Making your own iterator</h3>
<p>Any class with <code>__iter__</code> and <code>__next__</code> is an iterator. You will rarely need one, because a generator is a much shorter way to the same result, but it shows the protocol plainly.</p>
<pre class="code">class PortRange:
    def __init__(self, prefix, last):
        self.prefix = prefix
        self.last = last
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n &gt;= self.last:
            raise StopIteration
        self.n += 1
        return self.prefix + str(self.n)

print(list(PortRange("Fa0/", 2)))
print(sorted(PortRange("Gi0/", 3), reverse=True))</pre>
<pre class="out">AUTO01$ python3 c4.py
['Fa0/1', 'Fa0/2']
<span class="hl">['Gi0/3', 'Gi0/2', 'Gi0/1']</span></pre>
<p>Anything that accepts an iterable (<code>list()</code>, <code>sorted()</code>, <code>sum()</code>, <code>for</code>) accepts this class, because it follows the protocol.</p>

<dl class="terms">
<dt>Iterable</dt><dd>Anything you can loop over: it can give you an iterator through <code>iter()</code>.</dd>
<dt>Iterator</dt><dd>An object that gives the next item with <code>next()</code> and remembers its place.</dd>
<dt>Generator</dt><dd>A convenient iterator made by a function with <code>yield</code>. Every generator is an iterator.</dd>
</dl>

<div class="warn"><p><b>Common mistakes.</b> Looping over an iterator twice and wondering why the second loop does nothing. Calling <code>next()</code> on a list: a list is iterable but not an iterator, so you must use <code>iter()</code> first. Forgetting that <code>zip</code>, <code>map</code> and <code>enumerate</code> are one-shot.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>StopIteration</code> is how iteration ends and a <code>for</code> loop hides it. It only reaches your code if you call <code>next()</code> yourself without a default.</p></div>

<div class="scn"><h4>The second loop that printed nothing</h4><p>An engineer zipped a list of switch names with a list of management addresses, printed the pairs for a check, and then looped over the same <code>zip</code> object to build the config. The check looked fine and the config was empty. The zip was a one-shot iterator, already used up by the print. Wrapping it in <code>list(zip(...))</code> once, and using that list twice, fixed it.</p><p><b>Lesson:</b> if you need the data twice, make a list; if you need it once, stream it.</p></div>

<div class="iv"><p class="q">"What is the difference between an iterable and an iterator?"</p><p>An iterable can produce an iterator when you call <code>iter()</code> on it, for example a list. An iterator has <code>__next__</code>, returns one item per call, remembers where it is, and raises <code>StopIteration</code> at the end. A list can be looped many times; most iterators, such as generators, can be consumed only once.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A <code>for</code> loop calls <code>iter()</code> once, then <code>next()</code> until <code>StopIteration</code>.</li>
<li>An iterable gives an iterator; an iterator remembers its place and is usually one-shot.</li>
<li><code>zip</code>, <code>map</code>, <code>enumerate</code> and generators are used up after one pass; lists and ranges are not.</li>
<li><code>next(it, default)</code> avoids the exception and is handy for "first match or none".</li>
<li>Files stream line by line in a <code>for</code> loop and never load whole.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> aapne <code>for port in ports:</code> kai baar likha hai. Yeh chapter dhakkan uthakar neeche ka chhota protocol dikhata hai. Ek baar yeh dikh jaye to generators ajeeb nahi lagte, aur Lab 2 ke bugs ka andaza lagana aasaan ho jaata hai.</p>

<h3>Analogy: bank ki token machine</h3>
<p>Bank mein queue hoti hai. <b>Queue khud</b> <b>iterable</b> hai: aap usse token machine maang sakte ho. <b>Token machine</b> <b>iterator</b> hai: jitni baar button dabate ho agla number deti hai aur yaad rakhti hai ki kahan hai. Numbers khatam hone par kehti hai "aur token nahi". Queue se doosri token machine maango to nayi milti hai jo shuru se chalti hai. Pehli machine ko khatam hone ke baad dobara dabao, tab bhi kuch nahi milta.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="iter() iterable ko iterator banata hai; next() StopIteration tak items kheenchta hai">
<rect x="20" y="40" width="150" height="62" rx="10" fill="#bae6fd"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="13">iterable</text><text x="95" y="88" text-anchor="middle" class="svg-muted" font-size="11">list, dict, file, range</text>
<rect x="250" y="40" width="150" height="62" rx="10" fill="#fde68a"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">iterator</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">apni jagah yaad rakhta hai</text>
<rect x="480" y="40" width="140" height="62" rx="10" fill="#bbf7d0"/><text x="550" y="68" text-anchor="middle" class="svg-ink" font-size="13">item</text><text x="550" y="88" text-anchor="middle" class="svg-muted" font-size="11">ek ek karke</text>
<line x1="170" y1="71" x2="250" y2="71" stroke="#64748b" stroke-width="2"/><text x="210" y="62" text-anchor="middle" class="svg-accent" font-size="12">iter()</text>
<line x1="400" y1="71" x2="480" y2="71" stroke="#64748b" stroke-width="2"/><text x="440" y="62" text-anchor="middle" class="svg-accent" font-size="12">next()</text>
<text x="325" y="140" text-anchor="middle" class="svg-muted" font-size="12">kuch bachne par next() StopIteration raise karta hai aur for loop chupchaap khatam</text>
</svg><p class="cap">iter() machine banata hai, next() button dabata hai.</p></div>

<h3>iter(), next() aur StopIteration</h3>
<pre class="code">ports = ["Gi0/1", "Gi0/2", "Gi0/3"]
it = iter(ports)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration: the belt is empty")
print(next(it, "no more"))</pre>
<pre class="out">AUTO01$ python3 c4.py
Gi0/1
Gi0/2
Gi0/3
<span class="hl">StopIteration: the belt is empty</span>
no more</pre>
<p><code>iter(ports)</code> list se uski token machine maangta hai. Har <code>next(it)</code> agla port deta hai. Teeno ports khatam hone par <code>next</code> exception <code>StopIteration</code> raise karta hai, jo error nahi balki ishara hai: "khatam". <code>next</code> ko doosra argument do to woh raise ki jagah woh default return karta hai, aur lab mein aage jaldi rukne ke liye yahi use hoga.</p>

<h3>For loop bas yahi hai, aapke liye likha hua</h3>
<p>Neeche ka loop bilkul wahi karta hai jo <code>for p in ports</code> karta hai. Python <code>iter()</code> ek baar call karta hai, <code>next()</code> baar-baar call karta hai, aur <code>StopIteration</code> dekhte hi chupchaap ruk jaata hai.</p>
<pre class="code">it = iter(ports)
while True:
    try:
        p = next(it)
    except StopIteration:
        break
    print("loop body:", p)</pre>
<pre class="out">AUTO01$ python3 c4.py
loop body: Gi0/1
loop body: Gi0/2
<span class="hl">loop body: Gi0/3</span></pre>
<p>Yahi chhota protocol wajah hai ki itni cheezein <code>for</code> loop mein chalti hain: lists, tuples, dictionaries, strings, ranges, files, aur woh generators jo aap aage likhoge.</p>

<h3>Iterable versus iterator: ek-baar ka niyam</h3>
<p><b>List</b> aisa iterable hai jo har baar naya iterator deta hai, isliye aap uspar jitni baar chahein loop chala sakte ho. Kai iterators <b>one-shot</b> hote hain: ek baar consume hone ke baad khaali rehte hain.</p>
<pre class="code">e = enumerate(ports, start=1)
print(list(e))
print(list(e))
z = zip(ports, ["up", "down", "up"])
print(dict(z))
print(dict(z))
r = range(3)
print(list(r), list(r), len(r))</pre>
<pre class="out">AUTO01$ python3 c4.py
[(1, 'Gi0/1'), (2, 'Gi0/2'), (3, 'Gi0/3')]
<span class="hl">[]</span>
{'Gi0/1': 'up', 'Gi0/2': 'down', 'Gi0/3': 'up'}
<span class="hl">{}</span>
[0, 1, 2] [0, 1, 2] 3
</pre>
<p><code>enumerate</code> aur <code>zip</code> iterators hain: doosre pass mein kuch bacha nahi milta. <code>range</code> aisa iterable hai jise baar-baar chala sakte ho aur uski length bhi hoti hai. <code>map</code> aur <code>reversed</code> <code>enumerate</code> jaise behave karte hain. Yahi niyam generators par bhi lagta hai, aur yahi is module ke sabse common bug ki wajah hai.</p>

<h3>Files bhi iterables hain</h3>
<p><code>for</code> loop mein file ek baar mein ek line deti hai aur poori file kabhi load nahi karti. <code>break</code> se loop jaldi chhod sakte ho; file wahin rehti hai jahan thi.</p>
<pre class="code">with open("router.log") as f:
    n = 0
    for line in f:
        n += 1
        if n == 2:
            break
    print(n, line.rstrip())

g = iter(open("router.log"))
print(next(g).rstrip())
print(next(g).rstrip())</pre>
<pre class="out">AUTO01$ python3 c4.py
<span class="hl">2 Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</span>
Sep 29 09:00:00 PUN-CORE-R1 %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Sep 29 09:00:07 BLR-EDGE-R2 %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</pre>
<div class="note"><p><b>Lab note.</b> Asli Python mein khuli file par seedha <code>next(f)</code> chala sakte ho. Lab ka file object <code>for</code> loops aur <code>iter(f)</code> support karta hai par akela <code>next(f)</code> nahi, isliye listing pehle <code>iter()</code> use karti hai. Yeh form dono jagah chalta hai.</p></div>

<h3>Apna iterator banana</h3>
<p>Jis class mein <code>__iter__</code> aur <code>__next__</code> ho woh iterator hai. Aapko iski kam hi zaroorat padegi, kyunki generator wahi natija bahut chhote tareeke se deta hai, par yeh protocol saaf dikha deta hai.</p>
<pre class="code">class PortRange:
    def __init__(self, prefix, last):
        self.prefix = prefix
        self.last = last
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n &gt;= self.last:
            raise StopIteration
        self.n += 1
        return self.prefix + str(self.n)

print(list(PortRange("Fa0/", 2)))
print(sorted(PortRange("Gi0/", 3), reverse=True))</pre>
<pre class="out">AUTO01$ python3 c4.py
['Fa0/1', 'Fa0/2']
<span class="hl">['Gi0/3', 'Gi0/2', 'Gi0/1']</span></pre>
<p>Jo bhi iterable leta hai (<code>list()</code>, <code>sorted()</code>, <code>sum()</code>, <code>for</code>) woh is class ko le leta hai, kyunki yeh protocol follow karti hai.</p>

<dl class="terms">
<dt>Iterable</dt><dd>Jis par loop chala sako: woh <code>iter()</code> se aapko iterator de sakta hai.</dd>
<dt>Iterator</dt><dd>Aisa object jo <code>next()</code> se agla item deta hai aur apni jagah yaad rakhta hai.</dd>
<dt>Generator</dt><dd><code>yield</code> wale function se bana aasaan iterator. Har generator iterator hota hai.</dd>
</dl>

<div class="warn"><p><b>Common mistakes.</b> Iterator par do baar loop chalana aur sochna ki doosra loop kuch kyon nahi karta. List par <code>next()</code> call karna: list iterable hai iterator nahi, pehle <code>iter()</code> chahiye. Yeh bhoolna ki <code>zip</code>, <code>map</code> aur <code>enumerate</code> one-shot hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>StopIteration</code> se hi iteration khatam hoti hai aur <code>for</code> loop use chhupa leta hai. Yeh aapke code tak tabhi pahunchta hai jab aap default ke bina khud <code>next()</code> call karo.</p></div>

<div class="scn"><h4>Doosra loop jo kuch print nahi karta tha</h4><p>Ek engineer ne switch names ki list ko management addresses ki list ke saath zip kiya, check ke liye pairs print kiye, aur phir wahi <code>zip</code> object par config banane ka loop chalaya. Check theek laga aur config khaali thi. Zip one-shot iterator tha, jo print ne pehle hi khatam kar diya tha. <code>list(zip(...))</code> ek baar banakar us list ko do baar use karne se theek hua.</p><p><b>Lesson:</b> data do baar chahiye to list banao; ek baar chahiye to stream karo.</p></div>

<div class="iv"><p class="q">"Iterable aur iterator mein kya farq hai?"</p><p>Iterable par <code>iter()</code> call karne se iterator milta hai, jaise list. Iterator mein <code>__next__</code> hota hai, har call par ek item deta hai, apni jagah yaad rakhta hai, aur aakhir mein <code>StopIteration</code> raise karta hai. List par kai baar loop chal sakta hai; zyada tar iterators, jaise generators, sirf ek baar consume hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>for</code> loop <code>iter()</code> ek baar call karta hai, phir <code>StopIteration</code> tak <code>next()</code>.</li>
<li>Iterable iterator deta hai; iterator apni jagah yaad rakhta hai aur aksar one-shot hota hai.</li>
<li><code>zip</code>, <code>map</code>, <code>enumerate</code> aur generators ek pass ke baad khatam; lists aur ranges nahi.</li>
<li><code>next(it, default)</code> exception se bachata hai aur "pehla match ya none" ke liye kaam ka hai.</li>
<li>Files <code>for</code> loop mein line by line stream hoti hain aur poori load nahi hoti.</li>
</ul></div>
`}};export{e as default};