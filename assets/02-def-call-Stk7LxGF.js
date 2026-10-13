var e={id:`def-call`,h:{en:`Your first function: def and calling it`,hi:`Aapka pehla function: def aur use call karna`},body:{en:`
<p>In this chapter you will write your first function and learn the one idea everything else builds on: <b>defining</b> a function and <b>calling</b> it are two different steps. We use only one small idea per chapter, so do not hurry; run every example in your own lab terminal.</p>
<h3>What a function looks like</h3>
<p>Here is the smallest useful function. It prints a banner line that you might put at the top of a report.</p>
<pre class="code">def banner():
    print("=== Branch router audit ===")

banner()
banner()</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">=== Branch router audit ===
=== Branch router audit ===</pre>
<p>Line by line:</p>
<ul>
<li><code>def banner():</code> The word <code>def</code> (short for "define") tells Python: "I am teaching you a new command." <code>banner</code> is the <b>name</b> I chose. The brackets <code>()</code> are where inputs would go; they are empty for now. The <b>colon</b> <code>:</code> at the end says "the body follows".</li>
<li><code>    print("=== Branch router audit ===")</code> This line is the <b>body</b>. It is moved to the right by <b>4 spaces</b>. That indentation is how Python knows which lines belong to the function. There are no curly brackets in Python; the spaces are the structure.</li>
<li><code>banner()</code> This is a <b>call</b>. The name followed by brackets means "run that function now".</li>
</ul>
<p>Notice that the banner printed <b>twice</b>, because we called it twice. The <code>def</code> lines alone print nothing: defining a function is like writing the recipe card and putting it in the drawer. Nothing is cooked until somebody calls it.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="def stores the recipe, the call cooks it"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">def banner():</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">stored, nothing runs</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">banner()</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">the body runs</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">banner()</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">the body runs again</text></svg><p class="cap">def stores the recipe, the call cooks it</p></div>
<h3>Indentation is part of the language</h3>
<p>The body can have many lines. Every line must be indented by the same amount (use 4 spaces; do not mix tabs and spaces). The first line that is <b>not</b> indented ends the function.</p>
<pre class="code">def banner():
    print("=== Branch router audit ===")
    print("Run by: automation host AUTO")

print("Before the call")
banner()
print("After the call")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Before the call
=== Branch router audit ===
Run by: automation host AUTO
After the call</pre>
<p>The two <code>print</code> lines inside the function run only when <code>banner()</code> is called, so they appear <b>between</b> "Before the call" and "After the call". The last two <code>print</code> lines are not indented, so they are outside the function and run immediately.</p>
<h3>Calling a function inside a loop</h3>
<p>You already know <code>for</code> loops from the previous module. A function plus a loop is where automation starts to pay off: one function, many devices.</p>
<pre class="code">def check_router(name):
    print("Checking", name)

for router in ["R1", "R2", "R3"]:
    check_router(router)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Checking R1
Checking R2
Checking R3</pre>
<p>Here <code>name</code> is a placeholder inside the function. Each time the loop calls <code>check_router(router)</code>, the current value of <code>router</code> is dropped into <code>name</code>. We cover these placeholders properly in the next chapter; for now just see that the same code ran three times.</p>
<h3>Choosing good names</h3>
<ul>
<li>Use lowercase words joined by underscores: <code>check_router</code>, <code>build_intf_config</code>. This style is called <b>snake_case</b>.</li>
<li>Start with a verb that says what the function does: <code>get_uptime</code>, <code>save_report</code>.</li>
<li>A name cannot start with a digit or contain spaces or dashes. <code>check-router</code> is wrong; <code>check_router</code> is right.</li>
<li>Do not reuse the names of built-in tools such as <code>print</code>, <code>list</code> or <code>open</code>.</li>
</ul>
<h3>The order matters: define first, call later</h3>
<p>Python reads the file from top to bottom. If you call a function <b>before</b> the <code>def</code> line has been read, Python does not know the name yet.</p>
<pre class="code">check_router("R1")

def check_router(name):
    print("Checking", name)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "nameerr.py", line 1, in &lt;module&gt;
    check_router("R1")
NameError: name 'check_router' is not defined</pre>
<p>Read the last line of the traceback first: <code>NameError: name 'check_router' is not defined</code>. Newer Python versions may also print little <code>^^^^</code> markers under the code line; they only point at the problem, so you can ignore them. The fix is to move the call <b>below</b> the <code>def</code>. We read tracebacks fully in a later chapter.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the colon after <code>def name():</code> gives a SyntaxError. (2) Forgetting the brackets in the call: writing <code>banner</code> instead of <code>banner()</code> does not run the function; Python just treats it as a name and does nothing visible. (3) Indenting the body with 3 spaces on one line and 4 on the next gives an IndentationError.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may show a <code>def</code> with a <code>print</code> inside and no call, then ask what is printed. The answer is nothing. Always look for the call.</p></div>
<div class="scn"><h4>The script that printed nothing</h4><p>A junior engineer wrote a function <code>backup_all()</code> that looped over twelve routers, ran it, and saw an empty screen. He suspected SSH. A colleague opened the file, saw the <code>def backup_all():</code> line at the bottom and no call after it, and added <code>backup_all()</code> as the last line. The backup ran at once. The code was never wrong; it was simply never called.</p>
<p><b>Lesson:</b> when a script does nothing, check that the function is called before you debug the network.</p></div>
<div class="iv"><p class="q">"What is the difference between defining and calling a function?"</p><p>Defining with <code>def</code> creates the function and stores it under a name, but the body does not run. Calling it with brackets, such as <code>banner()</code>, runs the body. A function must be defined before the line that calls it executes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>def name():</code> followed by an indented body defines a function.</li>
<li>Defining does not run the body; calling with <code>name()</code> does.</li>
<li>The 4-space indentation marks which lines belong to the function.</li>
<li>Use snake_case verb names such as <code>check_router</code>.</li>
<li>Define before you call, otherwise you get a NameError.</li>
</ul></div>
`,hi:`
<p>Is chapter mein aap apna pehla function likhoge aur woh ek idea seekhoge jis par baaki sab bana hai: function ko <b>define</b> karna aur use <b>call</b> karna do alag steps hain. Hum har chapter mein sirf ek chhota idea lete hain, isliye jaldi mat karo; har example apne lab terminal mein chalao.</p>
<h3>Function dikhta kaisa hai</h3>
<p>Yeh sabse chhota kaam ka function hai. Yeh ek banner line print karta hai jo aap report ke top par rakh sakte ho.</p>
<pre class="code">def banner():
    print("=== Branch router audit ===")

banner()
banner()</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">=== Branch router audit ===
=== Branch router audit ===</pre>
<p>Line by line:</p>
<ul>
<li><code>def banner():</code> Shabd <code>def</code> ("define" ka short) Python ko batata hai: "main tumhe ek naya command sikha raha hoon." <code>banner</code> woh <b>naam</b> hai jo maine chuna. Brackets <code>()</code> mein inputs aate hain; abhi khaali hain. Aakhir ka <b>colon</b> <code>:</code> kehta hai "body aage hai".</li>
<li><code>    print("=== Branch router audit ===")</code> Yeh line <b>body</b> hai. Yeh <b>4 spaces</b> daayein hai. Isi indentation se Python jaanta hai ki kaun si lines function ki hain. Python mein curly brackets nahi hote; spaces hi structure hain.</li>
<li><code>banner()</code> Yeh ek <b>call</b> hai. Naam ke baad brackets ka matlab "woh function abhi chalao".</li>
</ul>
<p>Dekho banner <b>do baar</b> print hua, kyunki humne do baar call kiya. Akeli <code>def</code> lines kuch print nahi karti: function define karna recipe card likhkar drawer mein rakhne jaisa hai. Jab tak koi call na kare kuch pakta nahi.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="def recipe rakhta hai, call pakata hai"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">def banner():</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">store hota hai, kuch nahi chalta</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">banner()</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">body chalti hai</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">banner()</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">body phir chalti hai</text></svg><p class="cap">def recipe rakhta hai, call pakata hai</p></div>
<h3>Indentation language ka hissa hai</h3>
<p>Body mein kai lines ho sakti hain. Har line ek jitni indent honi chahiye (4 spaces use karo; tabs aur spaces mix mat karo). Pehli line jo indented <b>nahi</b> hai function ko khatam kar deti hai.</p>
<pre class="code">def banner():
    print("=== Branch router audit ===")
    print("Run by: automation host AUTO")

print("Before the call")
banner()
print("After the call")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Before the call
=== Branch router audit ===
Run by: automation host AUTO
After the call</pre>
<p>Function ke andar ki do <code>print</code> lines tabhi chalti hain jab <code>banner()</code> call hota hai, isliye woh "Before the call" aur "After the call" ke <b>beech</b> aati hain. Aakhri do <code>print</code> lines indented nahi hain, isliye function ke bahar hain aur turant chalti hain.</p>
<h3>Loop ke andar function call karna</h3>
<p><code>for</code> loops aap pichhle module mein seekh chuke ho. Function aur loop saath mein wahan hain jahan automation ka fayda shuru hota hai: ek function, bahut devices.</p>
<pre class="code">def check_router(name):
    print("Checking", name)

for router in ["R1", "R2", "R3"]:
    check_router(router)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Checking R1
Checking R2
Checking R3</pre>
<p>Yahan <code>name</code> function ke andar ek placeholder hai. Har baar loop <code>check_router(router)</code> call karta hai, <code>router</code> ki current value <code>name</code> mein aa jaati hai. In placeholders ko agle chapter mein theek se dekhenge; abhi bas dekho ki wahi code teen baar chala.</p>
<h3>Achhe naam chunna</h3>
<ul>
<li>Lowercase words underscore se jodkar likho: <code>check_router</code>, <code>build_intf_config</code>. Is style ko <b>snake_case</b> kehte hain.</li>
<li>Verb se shuru karo jo batata ho function kya karta hai: <code>get_uptime</code>, <code>save_report</code>.</li>
<li>Naam digit se shuru nahi ho sakta aur usme space ya dash nahi ho sakta. <code>check-router</code> galat hai; <code>check_router</code> sahi hai.</li>
<li><code>print</code>, <code>list</code> ya <code>open</code> jaise built-in tools ke naam dobara use mat karo.</li>
</ul>
<h3>Order matter karta hai: pehle define, baad mein call</h3>
<p>Python file ko upar se neeche padhta hai. Agar aap function ko <code>def</code> line padhne se <b>pehle</b> call karte ho, to Python ko naam abhi pata nahi hota.</p>
<pre class="code">check_router("R1")

def check_router(name):
    print("Checking", name)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "nameerr.py", line 1, in &lt;module&gt;
    check_router("R1")
NameError: name 'check_router' is not defined</pre>
<p>Traceback ki aakhri line pehle padho: <code>NameError: name 'check_router' is not defined</code>. Naye Python versions code line ke neeche chhote <code>^^^^</code> markers bhi print kar sakte hain; woh sirf problem ki taraf ishara karte hain, unhe ignore kar sakte ho. Fix hai call ko <code>def</code> ke <b>neeche</b> le jaana. Traceback poora padhna hum aage ke chapter mein seekhenge.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>def name():</code> ke baad colon bhoolna SyntaxError deta hai. (2) Call mein brackets bhoolna: <code>banner()</code> ki jagah <code>banner</code> likhne se function nahi chalta; Python use sirf ek naam maanta hai aur kuch dikhta nahi. (3) Body ki ek line 3 spaces aur agli 4 spaces se indent karna IndentationError deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question ek <code>def</code> dikha sakta hai jisme <code>print</code> hai aur call nahi, phir poochta hai kya print hoga. Jawab: kuch nahi. Hamesha call dhoondho.</p></div>
<div class="scn"><h4>Jo script kuch print nahi karti thi</h4><p>Ek junior engineer ne <code>backup_all()</code> function likha jo barah routers par loop chalata tha, use run kiya aur khaali screen dekhi. Use SSH par shak hua. Ek colleague ne file kholi, neeche <code>def backup_all():</code> line dekhi aur uske baad koi call nahi, aur aakhri line mein <code>backup_all()</code> joda. Backup turant chal gaya. Code kabhi galat nahi tha; bas call hi nahi hua tha.</p>
<p><b>Lesson:</b> script kuch na kare to network debug karne se pehle dekho ki function call hua ya nahi.</p></div>
<div class="iv"><p class="q">"Function define karne aur call karne mein kya difference hai?"</p><p><code>def</code> se define karne par function ban jaata hai aur naam ke saath store hota hai, lekin body nahi chalti. Brackets ke saath call karne par, jaise <code>banner()</code>, body chalti hai. Function ko us line se pehle define hona chahiye jo use call karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>def name():</code> aur uske baad indented body function define karti hai.</li>
<li>Define karne se body nahi chalti; <code>name()</code> se call karne par chalti hai.</li>
<li>4-space indentation batati hai ki kaun si lines function ki hain.</li>
<li><code>check_router</code> jaise snake_case verb naam use karo.</li>
<li>Call se pehle define karo, warna NameError aata hai.</li>
</ul></div>
`}};export{e as default};