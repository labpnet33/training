var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: fix the broken Router class (Lab 2)`,hi:`Troubleshooting workflow: toote hue Router class ko theek karo (Lab 2)`},body:{en:`
<p><b>The idea of this chapter:</b> you are handed someone else's class code that gives wrong numbers and then crashes. You will fix it the way a network engineer fixes a fault ticket: symptom, location, cause, one fix, verify. This chapter walks through Lab 2 (<code>py-oop-bugs</code>) task by task, with its real files and commands.</p>

<h3>Analogy: a fault ticket</h3>
<p>A ticket says "users in Hyderabad cannot reach the app". You do not reconfigure the whole network. You read the symptom, find where the path breaks, change one thing, and test again. A Python traceback is the same kind of evidence: the last line is the diagnosis, the line above is where it hurts.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Five-step debugging loop">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Run</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">read last line</text>
<rect x="135" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Locate</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="10">file and line</text>
<rect x="260" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Explain</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="10">why does it fail</text>
<rect x="385" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="10">one change only</text>
<rect x="510" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rerun</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="10">next error?</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">repeat until the output is clean</text>
</svg><p class="cap">The same five steps for every bug in this lab.</p></div>

<h3>The ticket and the files</h3>
<p>On AUTO01, <code>devmodel.py</code> holds the classes <code>Interface</code>, <code>Device</code> and <code>Router</code>, written in a hurry. <code>audit.py</code> builds some devices and prints what it finds. Look at the suspects by line number. Use <code>grep -n</code> or <code>cat -n</code>; plain <code>nl</code> skips blank lines, so its numbers would not match the traceback.</p>
<pre class="out">AUTO01$ grep -n "interfaces" devmodel.py
11:    def __init__(self, name, interfaces=[]):
13:        self.interfaces = interfaces
16:        self.interfaces.append(Interface(name, ip))
19:        return f"{self.name}: {len(self.interfaces)} interface(s)"</pre>

<h3>Task 1: run it and spot the wrong number</h3>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
<span class="hl">R3 interfaces: 1</span>
Traceback (most recent call last):
  File "audit.py", line 9, in &lt;module&gt;
    edge = Router("BLR-EDGE-R2", 65002)
  File "devmodel.py", line 24, in __init__
    super().__init__()
TypeError: Device.__init__() missing 1 required positional argument: 'name'</pre>
<p>Two problems are visible. <code>audit.py</code> gave R1 one interface and R3 none, yet it reports <b>1</b> for R3 (the answer to task 1). That is the quiet bug. The crash is the loud one. A crash tells you something is broken; a wrong number tells you your data is lying. Fix the quiet one first, because other fixes could hide it.</p>

<h3>Task 2: the shared default list</h3>
<p>Line 11 is <code>def __init__(self, name, interfaces=[])</code>. You met this trap in chapter 7: the <code>[]</code> is created once and shared, so R1's interface appeared in R3's list too. The cure is two edits: default to <code>None</code>, then build a fresh list inside.</p>
<pre class="code">sed -i 's/interfaces=\\[\\]):/interfaces=None):/' devmodel.py
sed -i 's/self.interfaces = interfaces$/self.interfaces = list(interfaces or [])/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
<span class="hl">R3 interfaces: 0</span>
Traceback (most recent call last):
  File "audit.py", line 9, in &lt;module&gt;
    edge = Router("BLR-EDGE-R2", 65002)
  File "devmodel.py", line 24, in __init__
    super().__init__()
TypeError: Device.__init__() missing 1 required positional argument: 'name'</pre>
<p>R3 now correctly reports 0. Read the sed commands: <code>s/old/new/</code> substitutes text. In the first command, <code>\\[\\]</code> means a literal pair of square brackets (brackets are special in patterns, so they are escaped). In the second, the <code>$</code> means "end of the line", so only the assignment line changes and the <code>self.interfaces.append</code> line is left alone. <code>list(interfaces or [])</code> makes a new list every time, even if a caller passes one in.</p>

<h3>Task 3: read a two-frame traceback</h3>
<p>The task asks which required argument is missing: <b>name</b>. Look at how the traceback is built. It lists the call chain from outside in. The first frame, <code>audit.py</code> line 9, is where your script called <code>Router(...)</code>. The second frame, <code>devmodel.py</code> line 24, is where the error actually happened, in <code>Router.__init__</code>, which calls <code>super().__init__()</code> with nothing. The parent <code>Device.__init__</code> needs a <code>name</code>, so Python complains about the parent. The mistake is in the child: line 24 is the line to edit.</p>

<h3>Task 4: pass the argument to the parent</h3>
<pre class="code">sed -i 's/super().__init__()/super().__init__(name)/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
Traceback (most recent call last):
  File "audit.py", line 11, in &lt;module&gt;
    print(edge.describe())
<span class="hl">TypeError: Device.describe() takes 0 positional arguments but 1 was given</span></pre>
<p>Progress: the router now builds, and the script advanced two lines, from 9 to 11. A new error is a good sign, because the previous one is gone. "Takes 0 positional arguments but 1 was given" is the fingerprint from chapter 3: a method defined without <code>self</code>. The first parameter of every method is <b>self</b> (the answer to task 4's question).</p>

<h3>Task 5: add self</h3>
<pre class="code">sed -i 's/def describe():/def describe(self):/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
BLR-EDGE-R2: 1 interface(s)
<span class="hl">audit OK</span></pre>
<p>All three bugs are fixed. Here is the corrected file, which you can show with <code>cat devmodel.py</code>:</p>
<pre class="out">AUTO01$ cat devmodel.py
class Interface:
    def __init__(self, name, ip=None):
        self.name = name
        self.ip = ip

    def __repr__(self):
        return f"Interface({self.name!r}, {self.ip!r})"


class Device:
    def __init__(self, name, interfaces=None):
        self.name = name
        self.interfaces = list(interfaces or [])

    def add_interface(self, name, ip=None):
        self.interfaces.append(Interface(name, ip))

    def describe(self):
        return f"{self.name}: {len(self.interfaces)} interface(s)"


class Router(Device):
    def __init__(self, name, asn):
        super().__init__(name)
        self.asn = asn</pre>

<h3>Task 6: one last feature</h3>
<p>Give <code>Router</code> its own <code>__str__</code>. <code>Router</code> is the last class in the file, so appending works, and the method must be indented four spaces to stay inside the class. Then append <code>print(edge)</code> to <code>audit.py</code>:</p>
<pre class="code">cat &gt;&gt; devmodel.py &lt;&lt;'EOF'

    def __str__(self):
        return f"{self.name} (AS{self.asn})"
EOF
cat &gt;&gt; audit.py &lt;&lt;'EOF'
print(edge)
EOF
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
BLR-EDGE-R2: 1 interface(s)
audit OK
<span class="hl">BLR-EDGE-R2 (AS65002)</span></pre>

<h3>The lessons behind the lab</h3>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Two objects share data</td><td>Mutable default <code>=[]</code></td><td><code>=None</code> and build the list inside</td></tr>
<tr><td><code>missing 1 required positional argument: 'name'</code> from a child</td><td><code>super().__init__()</code> without arguments</td><td><code>super().__init__(name)</code></td></tr>
<tr><td><code>takes 0 positional arguments but 1 was given</code></td><td>Method defined without <code>self</code></td><td><code>def describe(self):</code></td></tr>
<tr><td><code>'X' object has no attribute 'name'</code></td><td>Child skipped the parent's <code>__init__</code></td><td>Call <code>super().__init__(...)</code></td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Fixing several things at once, so you do not know which change worked. Editing the line shown in the first traceback frame instead of the last one. Running sed with a pattern that matches more lines than you meant. Believing the crash is the only bug while a wrong number is silently printed above it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The count in "takes 0 positional arguments but 1 was given" includes the object Python passes automatically. If you typed no arguments and see "but 1 was given", suspect a missing <code>self</code>.</p></div>

<div class="scn"><h4>Ticket: the audit says every new router has an interface</h4><p>A weekly report claimed that a router built that morning already had two interfaces, and then the report job crashed building a <code>Router</code> subclass. The engineer ran the audit, noticed the wrong count before the crash, and traced it to an <code>interfaces=[]</code> default. The crash turned out to be a <code>super().__init__()</code> call that forgot the name, and a method without <code>self</code> was waiting behind it. Three one-line fixes, applied one at a time, with a rerun after each, produced a clean report.</p><p><b>Lesson:</b> read the whole output, fix the quiet bug first, then clear the crashes in order.</p></div>

<div class="iv"><p class="q">"You get a TypeError about a missing argument inside a subclass. How do you debug it?"</p><p>I read the last line for the missing argument name, then look at the lowest traceback frame to find the exact line. If it is <code>super().__init__()</code> in a child, I pass the parent's required arguments. I change one thing, rerun, and check that the error moved on. I also check for related silent bugs such as shared mutable defaults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Run, locate, explain, fix one thing, rerun: repeat until the output is clean.</li>
<li>Fix wrong numbers before crashes; they are the quiet bugs.</li>
<li>Lab 2 bugs: shared <code>interfaces=[]</code>, <code>super().__init__()</code> without <code>name</code>, <code>describe()</code> without <code>self</code>.</li>
<li>The lowest traceback frame is where the error happened; the frames above show the call chain.</li>
<li>Use <code>grep -n</code> or <code>cat -n</code> for line numbers; <code>nl</code> skips blank lines.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> aapko kisi aur ka class code diya gaya hai jo galat numbers deta hai aur phir crash hota hai. Aap use waise theek karoge jaise network engineer fault ticket theek karta hai: symptom, location, cause, ek fix, verify. Yeh chapter Lab 2 (<code>py-oop-bugs</code>) ko task by task, uski asli files aur commands ke saath chalata hai.</p>

<h3>Analogy: fault ticket</h3>
<p>Ticket kehta hai "Hyderabad ke users app tak nahi pahunch pa rahe". Aap poora network reconfigure nahi karte. Symptom padhte ho, dhoondhte ho path kahan toot raha hai, ek cheez badalte ho, aur dobara test karte ho. Python traceback isi tarah ka evidence hai: aakhri line diagnosis hai, uske upar ki line batati hai kahan dard hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Paanch step ka debugging loop">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Run</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">aakhri line padho</text>
<rect x="135" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Locate</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="10">file aur line</text>
<rect x="260" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Explain</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="10">kyon fail hota hai</text>
<rect x="385" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="10">sirf ek change</text>
<rect x="510" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rerun</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="10">agla error?</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">output saaf hone tak dohrao</text>
</svg><p class="cap">Is lab ke har bug ke liye wahi paanch steps.</p></div>

<h3>Ticket aur files</h3>
<p>AUTO01 par <code>devmodel.py</code> mein <code>Interface</code>, <code>Device</code> aur <code>Router</code> classes hain, jaldi mein likhi hui. <code>audit.py</code> kuch devices banata hai aur jo milta hai print karta hai. Shak wali jagahein line number se dekho. <code>grep -n</code> ya <code>cat -n</code> use karo; plain <code>nl</code> blank lines ko skip karta hai, isliye uske numbers traceback se match nahi karenge.</p>
<pre class="out">AUTO01$ grep -n "interfaces" devmodel.py
11:    def __init__(self, name, interfaces=[]):
13:        self.interfaces = interfaces
16:        self.interfaces.append(Interface(name, ip))
19:        return f"{self.name}: {len(self.interfaces)} interface(s)"</pre>

<h3>Task 1: chalao aur galat number pakdo</h3>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
<span class="hl">R3 interfaces: 1</span>
Traceback (most recent call last):
  File "audit.py", line 9, in &lt;module&gt;
    edge = Router("BLR-EDGE-R2", 65002)
  File "devmodel.py", line 24, in __init__
    super().__init__()
TypeError: Device.__init__() missing 1 required positional argument: 'name'</pre>
<p>Do problems dikhte hain. <code>audit.py</code> ne R1 ko ek interface diya aur R3 ko koi nahi, phir bhi R3 ke liye <b>1</b> report karta hai (task 1 ka jawab). Yeh quiet bug hai. Crash loud bug hai. Crash batata hai kuch toota hai; galat number batata hai ki aapka data jhooth bol raha hai. Quiet wala pehle theek karo, kyunki doosre fixes use chhupa sakte hain.</p>

<h3>Task 2: shared default list</h3>
<p>Line 11 hai <code>def __init__(self, name, interfaces=[])</code>. Yeh trap aap chapter 7 mein mile the: <code>[]</code> ek baar banta hai aur shared hota hai, isliye R1 ka interface R3 ki list mein bhi dikha. Ilaaj do edits hain: default <code>None</code> karo, phir andar nayi list banao.</p>
<pre class="code">sed -i 's/interfaces=\\[\\]):/interfaces=None):/' devmodel.py
sed -i 's/self.interfaces = interfaces$/self.interfaces = list(interfaces or [])/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
<span class="hl">R3 interfaces: 0</span>
Traceback (most recent call last):
  File "audit.py", line 9, in &lt;module&gt;
    edge = Router("BLR-EDGE-R2", 65002)
  File "devmodel.py", line 24, in __init__
    super().__init__()
TypeError: Device.__init__() missing 1 required positional argument: 'name'</pre>
<p>R3 ab sahi 0 report karta hai. sed commands padho: <code>s/old/new/</code> text substitute karta hai. Pehle command mein <code>\\[\\]</code> ka matlab literal square brackets ki jodi hai (brackets pattern mein special hote hain, isliye escape kiye). Doosre mein <code>$</code> ka matlab "line ka ant", isliye sirf assignment wali line badalti hai aur <code>self.interfaces.append</code> wali line chhoot jaati hai. <code>list(interfaces or [])</code> har baar nayi list banata hai, chahe caller ek de bhi de.</p>

<h3>Task 3: do-frame traceback padhna</h3>
<p>Task poochta hai kaun sa required argument missing hai: <b>name</b>. Dekho traceback kaise bana hai. Woh call chain ko bahar se andar ki taraf list karta hai. Pehla frame, <code>audit.py</code> line 9, jahan aapki script ne <code>Router(...)</code> call kiya. Doosra frame, <code>devmodel.py</code> line 24, jahan error asal mein hua, <code>Router.__init__</code> mein, jo <code>super().__init__()</code> ko kuch diye bina call karta hai. Parent ke <code>Device.__init__</code> ko <code>name</code> chahiye, isliye Python parent ki shikayat karta hai. Galti child mein hai: line 24 edit karne wali line hai.</p>

<h3>Task 4: parent ko argument pass karo</h3>
<pre class="code">sed -i 's/super().__init__()/super().__init__(name)/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
Traceback (most recent call last):
  File "audit.py", line 11, in &lt;module&gt;
    print(edge.describe())
<span class="hl">TypeError: Device.describe() takes 0 positional arguments but 1 was given</span></pre>
<p>Progress: router ab ban jaata hai, aur script do lines aage badhi, 9 se 11. Naya error achhi nishani hai, kyunki pichhla chala gaya. "Takes 0 positional arguments but 1 was given" chapter 3 ki pehchaan hai: bina <code>self</code> ke define kiya method. Har method ka pehla parameter <b>self</b> hai (task 4 ke sawaal ka jawab).</p>

<h3>Task 5: self jodo</h3>
<pre class="code">sed -i 's/def describe():/def describe(self):/' devmodel.py
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
BLR-EDGE-R2: 1 interface(s)
<span class="hl">audit OK</span></pre>
<p>Teeno bugs theek ho gaye. Yeh sudhri hui file hai, jo <code>cat devmodel.py</code> se dikh sakti hai:</p>
<pre class="out">AUTO01$ cat devmodel.py
class Interface:
    def __init__(self, name, ip=None):
        self.name = name
        self.ip = ip

    def __repr__(self):
        return f"Interface({self.name!r}, {self.ip!r})"


class Device:
    def __init__(self, name, interfaces=None):
        self.name = name
        self.interfaces = list(interfaces or [])

    def add_interface(self, name, ip=None):
        self.interfaces.append(Interface(name, ip))

    def describe(self):
        return f"{self.name}: {len(self.interfaces)} interface(s)"


class Router(Device):
    def __init__(self, name, asn):
        super().__init__(name)
        self.asn = asn</pre>

<h3>Task 6: ek aakhri feature</h3>
<p><code>Router</code> ko apna <code>__str__</code> do. <code>Router</code> file ki aakhri class hai, isliye append chalta hai, aur method ko class ke andar rakhne ke liye chaar space indent chahiye. Phir <code>audit.py</code> mein <code>print(edge)</code> append karo:</p>
<pre class="code">cat &gt;&gt; devmodel.py &lt;&lt;'EOF'

    def __str__(self):
        return f"{self.name} (AS{self.asn})"
EOF
cat &gt;&gt; audit.py &lt;&lt;'EOF'
print(edge)
EOF
python3 audit.py</pre>
<pre class="out">AUTO01$ python3 audit.py
R1 interfaces: 1
R3 interfaces: 0
BLR-EDGE-R2: 1 interface(s)
audit OK
<span class="hl">BLR-EDGE-R2 (AS65002)</span></pre>

<h3>Lab ke peeche ke lessons</h3>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Do objects data share karte hain</td><td>Mutable default <code>=[]</code></td><td><code>=None</code> aur andar list banao</td></tr>
<tr><td>Child se <code>missing 1 required positional argument: 'name'</code></td><td>Bina arguments ke <code>super().__init__()</code></td><td><code>super().__init__(name)</code></td></tr>
<tr><td><code>takes 0 positional arguments but 1 was given</code></td><td>Bina <code>self</code> ka method</td><td><code>def describe(self):</code></td></tr>
<tr><td><code>'X' object has no attribute 'name'</code></td><td>Child ne parent ka <code>__init__</code> skip kiya</td><td><code>super().__init__(...)</code> call karo</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Kai cheezein ek saath theek karna, taaki pata na chale kaunsa change chala. Aakhri frame ki jagah pehle traceback frame ki line edit karna. sed ka pattern aisa rakhna jo iraade se zyada lines match kare. Yeh maan lena ki crash hi ekmatra bug hai jabki uske upar galat number chupke se print ho raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "takes 0 positional arguments but 1 was given" ki ginti mein woh object bhi aata hai jo Python apne aap pass karta hai. Aapne koi argument type nahi kiya aur "but 1 was given" dikhe, to missing <code>self</code> ka shak karo.</p></div>

<div class="scn"><h4>Ticket: audit kehta hai har naye router mein interface hai</h4><p>Ek weekly report ne kaha ki aaj subah bane router ke paas pehle se do interfaces hain, phir <code>Router</code> subclass banate waqt report job crash ho gayi. Engineer ne audit chalaya, crash se pehle galat count dekha, aur use <code>interfaces=[]</code> default tak trace kiya. Crash ek <code>super().__init__()</code> call nikla jisme name bhool gaye the, aur uske peeche bina <code>self</code> ka method intezaar kar raha tha. Teen ek-line ke fixes, ek ek karke, har ke baad rerun ke saath, saaf report le aaye.</p><p><b>Lesson:</b> poora output padho, quiet bug pehle theek karo, phir crashes ko order mein hatao.</p></div>

<div class="iv"><p class="q">"Subclass ke andar missing argument ka TypeError aaye to debug kaise karte ho?"</p><p>Aakhri line se missing argument ka naam padhta hoon, phir sabse neeche ke traceback frame se exact line dhoondhta hoon. Agar woh child mein <code>super().__init__()</code> hai, to parent ke required arguments pass karta hoon. Ek cheez badalta hoon, rerun karta hoon, aur dekhta hoon ki error aage badha. Saath mein shared mutable defaults jaise chupe bugs bhi check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Run, locate, explain, ek cheez fix, rerun: output saaf hone tak dohrao.</li>
<li>Galat numbers crashes se pehle theek karo; woh quiet bugs hain.</li>
<li>Lab 2 ke bugs: shared <code>interfaces=[]</code>, <code>name</code> ke bina <code>super().__init__()</code>, bina <code>self</code> ka <code>describe()</code>.</li>
<li>Sabse neeche ka traceback frame woh jagah hai jahan error hua; upar ke frames call chain dikhate hain.</li>
<li>Line numbers ke liye <code>grep -n</code> ya <code>cat -n</code>; <code>nl</code> blank lines skip karta hai.</li>
</ul></div>
`}};export{e as default};