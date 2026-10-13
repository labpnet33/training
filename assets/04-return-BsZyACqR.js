var e={id:`return-values`,h:{en:`return: handing a result back (and building the config function)`,hi:`return: result wapas dena (aur config function banana)`},body:{en:`
<p>So far our functions only <b>showed</b> text with <code>print()</code>. Real automation needs functions that <b>hand a value back</b> so the next line of the script can use it: save it to a file, send it to a router, or compare it with something. That is the job of <code>return</code>.</p>
<h3>print() shows, return gives back</h3>
<p><code>print()</code> writes on the screen and the value is then gone. <code>return</code> sends the value to the line that called the function. Compare:</p>
<pre class="code">def double_print(n):
    print(n * 2)

def double_return(n):
    return n * 2

double_print(21)
answer = double_return(21)
print("The answer is", answer)
print("Plus one:", answer + 1)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">42
The answer is 42
Plus one: 43</pre>
<p><code>double_print(21)</code> showed 42 but nothing was kept. <code>double_return(21)</code> gave 42 back and we stored it in the variable <code>answer</code>, then used it again in the next lines. The moment a function runs <code>return</code>, it stops and leaves, so any line after <code>return</code> inside that function never runs.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="return carries the value to the caller"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Caller</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">answer = double_return(21)</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Function</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">n * 2 = 42</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">return</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">42 goes back</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Caller</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">answer holds 42</text></svg><p class="cap">return carries the value to the caller</p></div>
<h3>What you get when there is no return</h3>
<p>If a function reaches its last line without a <code>return</code>, Python hands back a special value called <b>None</b>, which means "nothing here". This is the number one beginner bug in this module.</p>
<pre class="code">def build_line(ip):
    line = "ip address " + ip + " 255.255.255.0"

result = build_line("10.10.1.1")
print(result)
print(type(result))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">None
&lt;class 'NoneType'&gt;</pre>
<p>The function built the text, but it never returned it, so <code>result</code> is <code>None</code>. Now see the error this causes when you try to use that <code>None</code> as a list:</p>
<pre class="code">def build_lines(name):
    lines = []
    lines.append("interface " + name)
    lines.append(" no shutdown")

cfg = []
cfg += build_lines("GigabitEthernet0/1")
print(cfg)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "noreturn.py", line 7, in &lt;module&gt;
    cfg += build_lines("GigabitEthernet0/1")
TypeError: 'NoneType' object is not iterable</pre>
<p>The last line says <code>TypeError: 'NoneType' object is not iterable</code>. Translate it: "you tried to loop or add something that is <code>None</code>". Whenever you see <code>NoneType</code>, ask yourself first: did my function forget <code>return</code>?</p>
<h3>Returning a list of config lines</h3>
<p>For automation we usually return <b>data</b>, not printed text. A list of lines is perfect: you can print it, save it to a file, or push it to a router. Here is the function from lab 1, finished, and called three times. <code>"\\n".join(cfg)</code> glues the list into one text with a new line between the items.</p>
<pre class="code">def build_intf_config(name, ip, desc):
    """Return the config lines for one interface as a list."""
    lines = []
    lines.append(f"interface {name}")
    lines.append(f" description {desc}")
    lines.append(f" ip address {ip} 255.255.255.0")
    lines.append(" no shutdown")
    return lines

cfg = []
cfg += build_intf_config("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")
cfg += build_intf_config("GigabitEthernet0/2", "10.10.2.1", "LAN-CCTV")
cfg += build_intf_config("GigabitEthernet0/3", "10.10.3.1", "LAN-WIFI")
print("\\n".join(cfg))
print("Lines built:", len(cfg))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/3
 description LAN-WIFI
 ip address 10.10.3.1 255.255.255.0
 no shutdown
Lines built: 12</pre>
<p>Walk through it: the text in triple quotes right under the <code>def</code> is a <b>docstring</b>, a one-line description that tools and humans can read. <code>lines = []</code> starts an empty list. Each <code>append</code> adds one config line (the <code>f"..."</code> strings drop the parameter values into the text). <code>return lines</code> hands the finished list back. In the script, <code>cfg += ...</code> joins each returned list onto the big list. Three calls times four lines gives 12 lines, which is the number you will meet again in the lab.</p>
<h3>Variables inside a function stay inside</h3>
<p>A variable created inside a function (like <code>lines</code>) is <b>local</b>: it exists only while the function runs. The caller cannot see it.</p>
<pre class="code">def make_line():
    secret_line = "no shutdown"
    return secret_line

make_line()
print(secret_line)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "scope.py", line 6, in &lt;module&gt;
    print(secret_line)
NameError: name 'secret_line' is not defined</pre>
<p>The function ran fine, but the name <code>secret_line</code> does not exist outside it. To use a result, capture the returned value: <code>x = make_line()</code>. This keeps functions independent, which is exactly why they are safe to reuse.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Writing <code>print(...)</code> where <code>return</code> was needed: the lab script fails with the NoneType error. (2) Putting code after <code>return</code> and expecting it to run. (3) Writing <code>return</code> with the value on the next, un-indented line. (4) Forgetting to store the returned value: calling <code>build_intf_config(...)</code> alone throws the result away.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What does the function return if it has no return statement?" None. "What is <code>type(None)</code>?" NoneType. Also: <code>return</code> ends the function immediately.</p></div>
<div class="scn"><h4>The generator that produced twelve blank lines</h4><p>An engineer in the lab ran <code>intf.py</code> and got <code>TypeError: 'NoneType' object is not iterable</code> on line 16. The function printed correctly when tested alone, which made him suspect the list. A teammate told him to look at the end of the function. The last line was a comment saying "give the list back", not the statement. He typed <code>return lines</code>, the script built all twelve lines, and the push to R1 succeeded.</p>
<p><b>Lesson:</b> a NoneType error almost always means a missing <code>return</code>.</p></div>
<div class="iv"><p class="q">"What is the difference between print and return in a function?"</p><p><code>print</code> only displays text for a human and the value is lost. <code>return</code> gives the value back to the caller so it can be stored, tested, saved to a file or sent to a device. A function without <code>return</code> returns <code>None</code>. In automation I return data and print only at the edge of the script.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>return value</code> hands a result back and ends the function.</li>
<li>No <code>return</code> means the caller receives <code>None</code>.</li>
<li><code>TypeError: 'NoneType' object is not iterable</code> usually means a missing return.</li>
<li>Return data (a list of config lines), not printed text, so it can be reused.</li>
<li>Variables made inside a function are local; capture results with <code>x = function()</code>.</li>
</ul></div>
`,hi:`
<p>Ab tak hamare functions sirf <code>print()</code> se text <b>dikhate</b> the. Real automation ko aise functions chahiye jo <b>value wapas dein</b> taaki script ki agli line use use kar sake: file mein save kare, router ko bheje ya kisi se compare kare. Yeh <code>return</code> ka kaam hai.</p>
<h3>print() dikhata hai, return wapas deta hai</h3>
<p><code>print()</code> screen par likhta hai aur value phir gayab ho jaati hai. <code>return</code> value ko us line tak bhejta hai jisne function call kiya. Compare karo:</p>
<pre class="code">def double_print(n):
    print(n * 2)

def double_return(n):
    return n * 2

double_print(21)
answer = double_return(21)
print("The answer is", answer)
print("Plus one:", answer + 1)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">42
The answer is 42
Plus one: 43</pre>
<p><code>double_print(21)</code> ne 42 dikhaya lekin kuch rakha nahi. <code>double_return(21)</code> ne 42 wapas diya aur humne use variable <code>answer</code> mein rakha, phir agli lines mein dobara use kiya. Jaise hi function <code>return</code> chalata hai, woh ruk jaata hai aur nikal jaata hai, isliye function ke andar <code>return</code> ke baad ki koi line kabhi nahi chalti.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="return value caller tak le jaata hai"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Caller</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">answer = double_return(21)</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Function</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">n * 2 = 42</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">return</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">42 wapas jaata hai</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Caller</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">answer mein 42</text></svg><p class="cap">return value caller tak le jaata hai</p></div>
<h3>Return na ho to kya milta hai</h3>
<p>Agar function bina <code>return</code> ke aakhri line tak pahunch jaaye, Python ek khaas value wapas deta hai jise <b>None</b> kehte hain, matlab "yahan kuch nahi". Is module ka number one beginner bug yahi hai.</p>
<pre class="code">def build_line(ip):
    line = "ip address " + ip + " 255.255.255.0"

result = build_line("10.10.1.1")
print(result)
print(type(result))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">None
&lt;class 'NoneType'&gt;</pre>
<p>Function ne text banaya, lekin return nahi kiya, isliye <code>result</code> <code>None</code> hai. Ab dekho jab aap us <code>None</code> ko list ki tarah use karte ho to kaun sa error aata hai:</p>
<pre class="code">def build_lines(name):
    lines = []
    lines.append("interface " + name)
    lines.append(" no shutdown")

cfg = []
cfg += build_lines("GigabitEthernet0/1")
print(cfg)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "noreturn.py", line 7, in &lt;module&gt;
    cfg += build_lines("GigabitEthernet0/1")
TypeError: 'NoneType' object is not iterable</pre>
<p>Aakhri line kehti hai <code>TypeError: 'NoneType' object is not iterable</code>. Iska matlab: "aapne aisi cheez par loop ya add karne ki koshish ki jo <code>None</code> hai". Jab bhi <code>NoneType</code> dikhe, pehle khud se poochho: kya mere function ne <code>return</code> bhula diya?</p>
<h3>Config lines ki list return karna</h3>
<p>Automation mein hum aam taur par <b>data</b> return karte hain, printed text nahi. Lines ki list perfect hai: print kar sakte ho, file mein save kar sakte ho ya router ko bhej sakte ho. Yeh lab 1 ka function hai, poora kiya hua aur teen baar call kiya hua. <code>"\\n".join(cfg)</code> list ko ek text mein jodta hai jisme items ke beech nayi line hoti hai.</p>
<pre class="code">def build_intf_config(name, ip, desc):
    """Return the config lines for one interface as a list."""
    lines = []
    lines.append(f"interface {name}")
    lines.append(f" description {desc}")
    lines.append(f" ip address {ip} 255.255.255.0")
    lines.append(" no shutdown")
    return lines

cfg = []
cfg += build_intf_config("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")
cfg += build_intf_config("GigabitEthernet0/2", "10.10.2.1", "LAN-CCTV")
cfg += build_intf_config("GigabitEthernet0/3", "10.10.3.1", "LAN-WIFI")
print("\\n".join(cfg))
print("Lines built:", len(cfg))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/3
 description LAN-WIFI
 ip address 10.10.3.1 255.255.255.0
 no shutdown
Lines built: 12</pre>
<p>Dhyaan se dekho: <code>def</code> ke theek neeche triple quotes ka text <b>docstring</b> hai, ek line ka description jo tools aur insaan dono padh sakte hain. <code>lines = []</code> khaali list shuru karta hai. Har <code>append</code> ek config line jodta hai (<code>f"..."</code> strings parameter values ko text mein daal deti hain). <code>return lines</code> poori list wapas deta hai. Script mein <code>cfg += ...</code> har returned list ko badi list se jodta hai. Teen calls ganya chaar lines barabar 12 lines, jo number aap lab mein dobara dekhoge.</p>
<h3>Function ke andar ke variables andar hi rehte hain</h3>
<p>Function ke andar bana variable (jaise <code>lines</code>) <b>local</b> hai: woh sirf function chalte waqt rehta hai. Caller use dekh nahi sakta.</p>
<pre class="code">def make_line():
    secret_line = "no shutdown"
    return secret_line

make_line()
print(secret_line)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "scope.py", line 6, in &lt;module&gt;
    print(secret_line)
NameError: name 'secret_line' is not defined</pre>
<p>Function theek chala, lekin naam <code>secret_line</code> uske bahar exist nahi karta. Result use karne ke liye returned value pakdo: <code>x = make_line()</code>. Isse functions ek doosre se alag rehte hain, aur isi wajah se unhe reuse karna safe hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Jahan <code>return</code> chahiye wahan <code>print(...)</code> likhna: lab script NoneType error se fail hoti hai. (2) <code>return</code> ke baad code likhkar umeed karna ki woh chalega. (3) <code>return</code> ke saath value agli, bina indent wali line par likhna. (4) Returned value store karna bhoolna: sirf <code>build_intf_config(...)</code> call karne se result fenk diya jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Function mein return statement na ho to woh kya return karta hai?" None. "<code>type(None)</code> kya hai?" NoneType. Yeh bhi: <code>return</code> function ko turant khatam kar deta hai.</p></div>
<div class="scn"><h4>Jis generator ne barah khaali lines banayin</h4><p>Lab mein ek engineer ne <code>intf.py</code> chalayi aur line 16 par <code>TypeError: 'NoneType' object is not iterable</code> mila. Function akele test karne par sahi print karta tha, isliye use list par shak hua. Ek teammate ne kaha function ka end dekho. Aakhri line mein statement nahi, "give the list back" naam ka comment tha. Usne <code>return lines</code> type kiya, script ne barah lines bana di, aur R1 par push safal raha.</p>
<p><b>Lesson:</b> NoneType error ka matlab aksar <code>return</code> missing hota hai.</p></div>
<div class="iv"><p class="q">"Function mein print aur return ka kya difference hai?"</p><p><code>print</code> sirf insaan ke liye text dikhata hai aur value kho jaati hai. <code>return</code> value caller ko wapas deta hai taaki use store, test, file mein save ya device ko bheja ja sake. Bina <code>return</code> wala function <code>None</code> return karta hai. Automation mein main data return karta hoon aur print sirf script ke kinare par karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>return value</code> result wapas deta hai aur function ko khatam karta hai.</li>
<li><code>return</code> na ho to caller ko <code>None</code> milta hai.</li>
<li><code>TypeError: 'NoneType' object is not iterable</code> ka matlab aksar missing return hota hai.</li>
<li>Printed text nahi, data (config lines ki list) return karo taaki reuse ho sake.</li>
<li>Function ke andar ke variables local hote hain; result <code>x = function()</code> se pakdo.</li>
</ul></div>
`}};export{e as default};