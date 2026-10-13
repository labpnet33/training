var e={id:`methods-and-self`,h:{en:`Methods and self: give your objects behaviour`,hi:`Methods aur self: objects ko behaviour do`},body:{en:`
<p><b>The idea of this chapter:</b> a record card holds facts, but a smart card also knows how to answer questions about itself. A <b>method</b> is a function that lives inside a class and works on one object.</p>

<h3>Analogy: the card that answers back</h3>
<p>Imagine asking a router card "how many interfaces do you have?" and the card replies "2". You did not count the lines yourself; the card did, using its own data. In Python you write that as <code>r1.describe()</code>. The dot means "ask <code>r1</code> to run its <code>describe</code> method".</p>

<h3>What a method looks like</h3>
<p>A method is an ordinary <code>def</code> indented inside the class. Its first parameter is <code>self</code>. When you write <code>r1.describe()</code>, Python quietly turns it into <code>Device.describe(r1)</code>: the object before the dot becomes <code>self</code>. Through <code>self</code> the method can read and change that object's attributes.</p>
<pre class="code">class Interface:
    def __init__(self, name, ip=None, up=False):
        self.name = name
        self.ip = ip
        self.up = up

    def bring_up(self):
        self.up = True

    def summary(self):
        state = "up" if self.up else "down"
        return f"{self.name} {self.ip} {state}"


class Device:
    def __init__(self, name):
        self.name = name
        self.interfaces = []

    def add_interface(self, name, ip=None):
        self.interfaces.append(Interface(name, ip))

    def find(self, name):
        for i in self.interfaces:
            if i.name == name:
                return i
        return None

    def describe(self):
        return f"{self.name}: {len(self.interfaces)} interface(s)"


r1 = Device("PUN-CORE-R1")
r1.add_interface("Gi0/0", "10.0.0.1")
r1.add_interface("Gi0/1")
print(r1.describe())
gi = r1.find("Gi0/0")
print(gi.summary())
gi.bring_up()
print(gi.summary())
print(r1.find("Gi0/9"))
print(Device.describe(r1))</pre>
<pre class="out">AUTO01$ python3 c3a.py
PUN-CORE-R1: 2 interface(s)
Gi0/0 10.0.0.1 down
Gi0/0 10.0.0.1 up
None
PUN-CORE-R1: 2 interface(s)</pre>
<p>Walk through it. A <code>Device</code> owns a list of <code>Interface</code> objects: objects inside objects is normal and mirrors the real world (a router has interfaces). <code>add_interface</code> builds an <code>Interface</code> and appends it to <code>self.interfaces</code>. <code>find</code> loops over the interfaces and returns the matching one, or <code>None</code> when there is no match. <code>bring_up</code> changes the attribute <code>up</code> on that one interface, so the second <code>summary()</code> prints <code>up</code>. The last line proves the translation: <code>Device.describe(r1)</code> gives the same answer as <code>r1.describe()</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="r1.describe() becomes Device.describe(r1)">
<rect x="20" y="25" width="250" height="55" rx="10" fill="#bae6fd"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="13">r1.describe()</text><text x="145" y="68" text-anchor="middle" class="svg-muted" font-size="10">what you write</text>
<rect x="370" y="25" width="250" height="55" rx="10" fill="#bbf7d0"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="13">Device.describe(r1)</text><text x="495" y="68" text-anchor="middle" class="svg-muted" font-size="10">what Python runs</text>
<line x1="270" y1="52" x2="370" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="105" width="400" height="48" rx="10" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">def describe(self): ... self is r1</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="10">the object before the dot becomes the first parameter</text>
</svg><p class="cap">The dot call hands the object to the method as self.</p></div>

<h3>Methods that return versus methods that change</h3>
<p>Two kinds are common. A <b>query</b> method such as <code>describe()</code> or <code>find()</code> returns an answer and leaves the object alone. A <b>command</b> method such as <code>bring_up()</code> or <code>add_interface()</code> changes the object and usually returns nothing. Keeping them apart makes code easier to trust: you can call a query ten times and nothing happens.</p>

<h3>Three classic mistakes with self</h3>
<p><b>1. Declaring a method without self.</b> This is Lab 2's third bug. The definition has no parameters, but Python passes the object anyway:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name

    def describe():
        return "x"

r1 = Device("PUN-CORE-R1")
print(r1.describe())</pre>
<pre class="out">AUTO01$ python3 c3b.py
Traceback (most recent call last):
  File "c3b.py", line 9, in &lt;module&gt;
    print(r1.describe())
<span class="hl">TypeError: Device.describe() takes 0 positional arguments but 1 was given</span></pre>
<p>"Takes 0 but 1 was given" is the fingerprint of a missing <code>self</code>. The "1 given" is the object Python slipped in. The fix is one word: <code>def describe(self):</code>.</p>
<p><b>2. Forgetting self. when you assign.</b> Inside a method, <code>name = new</code> creates a local variable that vanishes when the method ends; only <code>self.name = new</code> changes the object:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name

    def rename(self, new):
        name = new

r1 = Device("PUN-CORE-R1")
r1.rename("PUN-CORE-R9")
print(r1.name)</pre>
<pre class="out">AUTO01$ python3 c3c.py
<span class="hl">PUN-CORE-R1</span></pre>
<p>No error, and no rename. This silent bug is nastier than a crash, so when a value does not change, check for the missing <code>self.</code>.</p>
<p><b>3. Calling a method on the class with the wrong arguments.</b> <code>r1.describe(1)</code> passes the object plus <code>1</code>, so a method defined as <code>describe(self)</code> reports "takes 1 positional argument but 2 were given". Count the object when you read these messages: the number Python reports is always one higher than the number you typed.</p>

<div class="eg"><p><b>Worked example.</b> You need a rule "an interface counts as configured when it has an IP". Instead of repeating <code>if i.ip is not None</code> in five scripts, add one method to <code>Interface</code>: <code>def is_configured(self): return self.ip is not None</code>. Every script now calls <code>i.is_configured()</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Missing <code>self</code> in the <code>def</code> line. Missing <code>self.</code> when assigning or when reading an attribute inside a method. Writing <code>r1.describe</code> without brackets: you get the method itself, not its result. Doing the printing inside a method that should <code>return</code> text, which makes it hard to reuse or test.</p></div>
<div class="exam"><p><b>Exam trap.</b> The word <code>self</code> is only a convention, not a keyword; but the <i>first parameter</i> always receives the object. Name it anything else and the code still works, yet every Python reader will be confused. Always write <code>self</code>.</p></div>

<div class="scn"><h4>The method that counted nothing</h4><p>An audit script reported "0 interfaces" for every router. The author had written <code>def count(self): interfaces = len(self.interfaces)</code> and printed the method result, but no <code>return</code> statement existed, so Python returned <code>None</code> and the report printed 0 through a fallback. Adding <code>return len(self.interfaces)</code> fixed it.</p><p><b>Lesson:</b> a query method needs a <code>return</code>; assigning to a local name does not hand anything back.</p></div>

<div class="iv"><p class="q">"What is the difference between a function and a method?"</p><p>A method is a function defined inside a class. Its first parameter, <code>self</code>, receives the object it is called on, so <code>r1.describe()</code> runs <code>Device.describe(r1)</code>. That is how a method reads and changes that object's own attributes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A method is a function inside a class; its first parameter is <code>self</code>.</li>
<li><code>r1.describe()</code> is the same as <code>Device.describe(r1)</code>.</li>
<li>Objects can hold other objects: a <code>Device</code> owns a list of <code>Interface</code> objects.</li>
<li>"Takes 0 positional arguments but 1 was given" means a missing <code>self</code>.</li>
<li>Assign with <code>self.x = ...</code> to change the object; a bare <code>x = ...</code> is lost.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> record card facts rakhta hai, par smart card apne baare mein sawaalon ka jawab dena bhi jaanta hai. <b>Method</b> woh function hai jo class ke andar rehta hai aur ek object par kaam karta hai.</p>

<h3>Analogy: jo card jawab deta hai</h3>
<p>Socho router card se poochte ho "tumhare kitne interfaces hain?" aur card kehta hai "2". Aapne lines khud nahi ginin; card ne apne data se ginin. Python mein yeh <code>r1.describe()</code> likhte hain. Dot ka matlab: "<code>r1</code> se kaho apna <code>describe</code> method chalaye".</p>

<h3>Method kaisa dikhta hai</h3>
<p>Method class ke andar indented ek normal <code>def</code> hai. Uska pehla parameter <code>self</code> hota hai. Jab aap <code>r1.describe()</code> likhte ho to Python chupke se ise <code>Device.describe(r1)</code> bana deta hai: dot se pehle ka object <code>self</code> ban jaata hai. <code>self</code> ke zariye method us object ke attributes padh aur badal sakta hai.</p>
<pre class="code">class Interface:
    def __init__(self, name, ip=None, up=False):
        self.name = name
        self.ip = ip
        self.up = up

    def bring_up(self):
        self.up = True

    def summary(self):
        state = "up" if self.up else "down"
        return f"{self.name} {self.ip} {state}"


class Device:
    def __init__(self, name):
        self.name = name
        self.interfaces = []

    def add_interface(self, name, ip=None):
        self.interfaces.append(Interface(name, ip))

    def find(self, name):
        for i in self.interfaces:
            if i.name == name:
                return i
        return None

    def describe(self):
        return f"{self.name}: {len(self.interfaces)} interface(s)"


r1 = Device("PUN-CORE-R1")
r1.add_interface("Gi0/0", "10.0.0.1")
r1.add_interface("Gi0/1")
print(r1.describe())
gi = r1.find("Gi0/0")
print(gi.summary())
gi.bring_up()
print(gi.summary())
print(r1.find("Gi0/9"))
print(Device.describe(r1))</pre>
<pre class="out">AUTO01$ python3 c3a.py
PUN-CORE-R1: 2 interface(s)
Gi0/0 10.0.0.1 down
Gi0/0 10.0.0.1 up
None
PUN-CORE-R1: 2 interface(s)</pre>
<p>Chalo samjhein. <code>Device</code> ke paas <code>Interface</code> objects ki list hai: objects ke andar objects normal hai aur asli duniya jaisa hai (router ke paas interfaces hote hain). <code>add_interface</code> ek <code>Interface</code> banata hai aur <code>self.interfaces</code> mein jodta hai. <code>find</code> interfaces par loop karke matching wala return karta hai, ya match na ho to <code>None</code>. <code>bring_up</code> sirf us ek interface ka attribute <code>up</code> badalta hai, isliye doosra <code>summary()</code> <code>up</code> print karta hai. Aakhri line translation saabit karti hai: <code>Device.describe(r1)</code> wahi jawab deta hai jo <code>r1.describe()</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="r1.describe() Device.describe(r1) ban jaata hai">
<rect x="20" y="25" width="250" height="55" rx="10" fill="#bae6fd"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="13">r1.describe()</text><text x="145" y="68" text-anchor="middle" class="svg-muted" font-size="10">jo aap likhte ho</text>
<rect x="370" y="25" width="250" height="55" rx="10" fill="#bbf7d0"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="13">Device.describe(r1)</text><text x="495" y="68" text-anchor="middle" class="svg-muted" font-size="10">jo Python chalata hai</text>
<line x1="270" y1="52" x2="370" y2="52" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="105" width="400" height="48" rx="10" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">def describe(self): ... self is r1</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="10">dot se pehle ka object pehla parameter ban jaata hai</text>
</svg><p class="cap">Dot call object ko self ki tarah method ko deta hai.</p></div>

<h3>Jo return karte hain aur jo badalte hain</h3>
<p>Do kism aam hain. <b>Query</b> method jaise <code>describe()</code> ya <code>find()</code> jawab return karta hai aur object ko chhodta nahi badalta. <b>Command</b> method jaise <code>bring_up()</code> ya <code>add_interface()</code> object ko badalta hai aur aam taur par kuch return nahi karta. Inhe alag rakhne se code par bharosa karna aasan hota hai: query ko dus baar call karo, kuch nahi hota.</p>

<h3>self ke teen classic mistakes</h3>
<p><b>1. Method bina self ke declare karna.</b> Yeh Lab 2 ka teesra bug hai. Definition mein koi parameter nahi, par Python phir bhi object pass karta hai:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name

    def describe():
        return "x"

r1 = Device("PUN-CORE-R1")
print(r1.describe())</pre>
<pre class="out">AUTO01$ python3 c3b.py
Traceback (most recent call last):
  File "c3b.py", line 9, in &lt;module&gt;
    print(r1.describe())
<span class="hl">TypeError: Device.describe() takes 0 positional arguments but 1 was given</span></pre>
<p>"Takes 0 but 1 was given" missing <code>self</code> ki pehchaan hai. Jo "1 given" hai woh object hai jo Python ne chupke se de diya. Fix ek shabd ka hai: <code>def describe(self):</code>.</p>
<p><b>2. Assign karte waqt self. bhool jana.</b> Method ke andar <code>name = new</code> local variable banata hai jo method khatam hote hi gayab ho jaata hai; sirf <code>self.name = new</code> object ko badalta hai:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name

    def rename(self, new):
        name = new

r1 = Device("PUN-CORE-R1")
r1.rename("PUN-CORE-R9")
print(r1.name)</pre>
<pre class="out">AUTO01$ python3 c3c.py
<span class="hl">PUN-CORE-R1</span></pre>
<p>Na error, na rename. Yeh chupa hua bug crash se bhi bura hai, isliye value na badle to missing <code>self.</code> check karo.</p>
<p><b>3. Method ko galat arguments ke saath call karna.</b> <code>r1.describe(1)</code> object ke saath <code>1</code> bhi pass karta hai, isliye <code>describe(self)</code> wala method batata hai "takes 1 positional argument but 2 were given". Aise messages padhte waqt object ko ginti mein lo: Python jo number batata hai woh aapke type kiye number se hamesha ek zyada hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko rule chahiye "interface configured tab maana jaata hai jab uska IP ho". Paanch scripts mein <code>if i.ip is not None</code> dohrane ki jagah <code>Interface</code> mein ek method jodo: <code>def is_configured(self): return self.ip is not None</code>. Ab har script <code>i.is_configured()</code> call karti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>def</code> line mein <code>self</code> chhod dena. Assign karte ya method ke andar attribute padhte waqt <code>self.</code> chhod dena. Bracket ke bina <code>r1.describe</code> likhna: result nahi, method khud milta hai. Jis method ko text <code>return</code> karna chahiye usme print karna, jisse use reuse ya test karna mushkil hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>self</code> shabd sirf convention hai, keyword nahi; par <i>pehla parameter</i> hamesha object paata hai. Kuch aur naam do to code chalta hai, par har Python padhne wala confuse hoga. Hamesha <code>self</code> likho.</p></div>

<div class="scn"><h4>Jis method ne kuch gina nahi</h4><p>Ek audit script har router ke liye "0 interfaces" report kar rahi thi. Author ne <code>def count(self): interfaces = len(self.interfaces)</code> likha tha aur method ka result print kiya, par koi <code>return</code> statement nahi tha, isliye Python ne <code>None</code> return kiya aur report fallback se 0 print karti rahi. <code>return len(self.interfaces)</code> jodne se theek ho gaya.</p><p><b>Lesson:</b> query method ko <code>return</code> chahiye; local naam mein assign karne se kuch wapas nahi milta.</p></div>

<div class="iv"><p class="q">"Function aur method mein kya fark hai?"</p><p>Method woh function hai jo class ke andar define hota hai. Uska pehla parameter <code>self</code> us object ko paata hai jis par call hua, isliye <code>r1.describe()</code> asal mein <code>Device.describe(r1)</code> chalata hai. Isi tarah method us object ke apne attributes padhta aur badalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method class ke andar ka function hai; uska pehla parameter <code>self</code> hai.</li>
<li><code>r1.describe()</code> aur <code>Device.describe(r1)</code> same hain.</li>
<li>Objects dusre objects rakh sakte hain: <code>Device</code> ke paas <code>Interface</code> objects ki list hoti hai.</li>
<li>"Takes 0 positional arguments but 1 was given" ka matlab <code>self</code> missing hai.</li>
<li>Object badalne ke liye <code>self.x = ...</code> likho; bare <code>x = ...</code> kho jaata hai.</li>
</ul></div>
`}};export{e as default};