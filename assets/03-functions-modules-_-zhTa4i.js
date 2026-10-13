var e={id:`functions-modules`,h:{en:`Organising code: functions and modules`,hi:`Code organise karna: functions aur modules`},body:{en:`
<p>A script that grows line by line becomes a wall of text. The blueprint item 1.5 asks for the <b>benefits of organising code into functions, classes and modules</b>. This chapter covers functions and modules; the next one covers classes.</p>

<h3>Analogy: a toolbox instead of a heap</h3>
<p>Imagine a workshop where every screw, wrench and drill bit lies in one heap on the floor. You can still repair things, but slowly, and you lose parts. Now sort them: a drawer for screws, a rack for wrenches, a labelled box for each job. <b>Functions</b> are the individual tools, <b>classes</b> are tool sets that belong together, and <b>modules</b> are the labelled boxes (files) that hold them.</p>

<h3>Functions: name a job and reuse it</h3>
<p>A <b>function</b> is a named block of code that does one job. You write it once and <b>call</b> it as often as you like. The values you give it are <b>parameters</b>, and the value it hands back is the <b>return value</b>. The Python modules of this academy introduced <code>def</code>; here we look at <i>why</i> it matters for design.</p>
<pre class="code"><span class="c"># one job: decide if a VLAN id is legal</span>
def is_valid_vlan(vid):
    """True if vid is a whole number from 1 to 4094."""
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

<span class="c"># another job: build the config lines for one VLAN</span>
def make_vlan_config(vid, name):
    """Return the config lines for one VLAN. A bad id raises ValueError."""
    if not is_valid_vlan(vid):
        raise ValueError(f"bad VLAN id {vid}")
    return [f"vlan {vid}", f" name {name}"]

print(make_vlan_config(10, "USERS"))</pre>
<pre class="out"><span class="hl">['vlan 10', ' name USERS']</span></pre>
<p>Notice that <code>make_vlan_config</code> <i>reuses</i> <code>is_valid_vlan</code>. Functions call other functions, and that is how big programs are built from small, checked pieces.</p>

<h3>Why functions help</h3>
<ul>
<li><b>No repetition (DRY, "don't repeat yourself").</b> If the VLAN rule lives in one place, a change from 4094 to some other limit is a one-line fix, not a hunt through twenty copies.</li>
<li><b>Readability.</b> <code>make_vlan_config(10, "USERS")</code> says what happens; the five lines inside can be read only when needed.</li>
<li><b>Testability.</b> A function with clear inputs and one return value is easy to test: call it, compare the result. You will do this from chapter 8 on.</li>
<li><b>Teamwork.</b> Two engineers can work on two functions at once without editing the same lines.</li>
<li><b>Hiding detail (abstraction).</b> The caller does not need to know how the config is built, only what goes in and what comes out.</li>
</ul>
<div class="tip"><p><b>Rule of thumb.</b> One function, one job, a name that is a verb phrase (<code>parse_vlan_list</code>, <code>build_config</code>). If you need the word "and" to describe it, split it. Keep functions short enough to read on one screen. Avoid hidden dependence on global variables: pass what the function needs as parameters.</p></div>

<h3>Modules: files that hold related functions</h3>
<p>A <b>module</b> in Python is simply a <code>.py</code> file. When you put related functions in <code>vlan_tools.py</code>, any other script can use them with <code>import</code>. A <b>package</b> is a folder of modules (with an <code>__init__.py</code> file). The standard library you already used (<code>json</code>, <code>ipaddress</code>, <code>os</code>) is a collection of modules written by others.</p>
<pre class="code"><span class="c"># file: vlan_tools.py</span>
def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

<span class="c"># file: audit.py  (a different file)</span>
import vlan_tools                          <span class="c"># bring in the whole module</span>
from vlan_tools import make_vlan_config    <span class="c"># or just one function</span>
import ipaddress                           <span class="c"># a standard-library module</span>

print(vlan_tools.is_valid_vlan(4095))      <span class="c"># module name, dot, function</span>
print(ipaddress.ip_address("192.0.2.10").is_private)</pre>
<pre class="out"><span class="hl">False</span>
True</pre>
<p>Using <code>vlan_tools.is_valid_vlan</code> keeps names in a <b>namespace</b>: two modules can both have a function called <code>validate</code> without clashing, because you write <code>vlan_tools.validate</code> and <code>ip_tools.validate</code>.</p>

<h3>The main guard: a module that is also a program</h3>
<p>When Python runs a file directly, a special variable <code>__name__</code> equals <code>"__main__"</code>. When the file is imported, <code>__name__</code> is the module name. So you can add a block that runs only when the file is executed directly, perfect for a small demo or for running tests.</p>
<pre class="code">def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

if __name__ == "__main__":
    print("self-check:", is_valid_vlan(10), is_valid_vlan(0))</pre>
<pre class="out"><span class="hl">self-check: True False</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Modules and functions">
<rect x="10" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">vlan_tools.py</text>
<rect x="25" y="45" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="12">is_valid_vlan()</text>
<rect x="25" y="85" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="12">make_vlan_config()</text>
<rect x="25" y="125" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="145" text-anchor="middle" class="svg-ink" font-size="12">parse_vlan_list()</text>
<rect x="440" y="10" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">audit.py</text><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="12">import vlan_tools</text>
<rect x="440" y="100" width="190" height="80" rx="10" fill="#fde68a"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">test_vlan.py</text><text x="535" y="150" text-anchor="middle" class="svg-ink" font-size="12">import vlan_tools</text>
<line x1="200" y1="60" x2="438" y2="50" stroke="#64748b" stroke-width="2"/><line x1="200" y1="130" x2="438" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">one source of truth, many users</text>
</svg><p class="cap">One module, written and fixed once, serves the real tool and its tests.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Naming your own file after a standard module (a file called <code>json.py</code> hides the real <code>json</code>). Forgetting <code>return</code> so the caller receives <code>None</code>. Writing a function that both prints and returns, which makes testing awkward. Putting everything in one 900-line file because "it works".</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the benefits wording: reuse, readability, maintainability, easier testing, collaboration, namespaces. A question that asks for the benefit of a module will often have "keeps related code together and avoids name clashes" as the right answer, while "makes the code run faster" is the distractor.</p></div>
<p><b>In the lab.</b> Both labs keep the code and its tests in a single <code>vlan_tools.py</code> on host AUTO, because the lab Python cannot import one of your files from another. On a real laptop you would split them: <code>vlan_tools.py</code> for the code and <code>test_vlan_tools.py</code> that does <code>import vlan_tools</code>.</p>

<div class="scn"><h4>One rule, twenty copies</h4><p>A network team's scripts each had their own copy of "is this VLAN allowed". When the company reserved VLANs 3000 to 3100 for a new service, the rule was updated in eleven scripts and forgotten in nine. Two of them still pushed VLAN 3050 to an access switch. After the incident the team created one <code>vlan_tools</code> module, deleted the copies and wrote tests against it.</p><p><b>Lesson:</b> a rule that lives in one function gets fixed once.</p></div>
<div class="iv"><p class="q">"Why split code into functions and modules?"</p><p>Reuse and no duplication, because a rule or fix lives in one place; readability, because names describe intent; testability, because small functions with clear inputs are easy to check; collaboration, because people work on separate pieces; and namespaces, which prevent name clashes. Give a network example such as one shared VLAN validator used by several scripts.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A function is a named, reusable job; parameters go in, a return value comes out.</li>
<li>DRY: keep each rule in one place.</li>
<li>A module is a .py file; a package is a folder of modules; import brings them in under a namespace.</li>
<li>The main guard runs code only when a file is executed directly.</li>
<li>Small functions with clear inputs are the easiest to test.</li>
</ul></div>
`,hi:`
<p>Jo script line by line badhti hai woh text ki deewar ban jaati hai. Blueprint item 1.5 poochta hai <b>code ko functions, classes aur modules mein organise karne ke benefits</b>. Yeh chapter functions aur modules cover karta hai; agla chapter classes.</p>

<h3>Analogy: dher ki jagah toolbox</h3>
<p>Ek workshop socho jahan har screw, wrench aur drill bit zameen par ek dher mein pada hai. Aap tab bhi repair kar sakte ho, par dheere, aur parts kho jaate hain. Ab unhe sort karo: screws ke liye drawer, wrenches ke liye rack, har kaam ke liye label wala box. <b>Functions</b> alag alag tools hain, <b>classes</b> woh tool sets hain jo saath belong karte hain, aur <b>modules</b> woh label wale boxes (files) hain jo unhe rakhte hain.</p>

<h3>Functions: kaam ko naam do aur reuse karo</h3>
<p><b>Function</b> ek naam wala code block hai jo ek kaam karta hai. Ek baar likho aur jitni baar chaho <b>call</b> karo. Jo values aap dete ho woh <b>parameters</b> hain, aur jo value woh wapas deta hai woh <b>return value</b>. Is academy ke Python modules ne <code>def</code> introduce kiya; yahan hum dekhte hain ki design ke liye yeh <i>kyun</i> matter karta hai.</p>
<pre class="code"><span class="c"># ek kaam: VLAN id legal hai ya nahi</span>
def is_valid_vlan(vid):
    """True if vid is a whole number from 1 to 4094."""
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

<span class="c"># doosra kaam: ek VLAN ki config lines banao</span>
def make_vlan_config(vid, name):
    """Return the config lines for one VLAN. A bad id raises ValueError."""
    if not is_valid_vlan(vid):
        raise ValueError(f"bad VLAN id {vid}")
    return [f"vlan {vid}", f" name {name}"]

print(make_vlan_config(10, "USERS"))</pre>
<pre class="out"><span class="hl">['vlan 10', ' name USERS']</span></pre>
<p>Dekho <code>make_vlan_config</code> <i>reuse</i> karta hai <code>is_valid_vlan</code> ko. Functions doosre functions ko call karte hain, aur bade programs aise hi chhote, check kiye hue pieces se bante hain.</p>

<h3>Functions kyun madad karte hain</h3>
<ul>
<li><b>Repetition nahi (DRY, "don't repeat yourself").</b> Agar VLAN rule ek jagah rehta hai, to 4094 se kisi aur limit par badalna ek line ka fix hai, bees copies mein dhoondhna nahi.</li>
<li><b>Readability.</b> <code>make_vlan_config(10, "USERS")</code> batata hai kya hota hai; andar ki paanch lines tabhi padho jab zaroorat ho.</li>
<li><b>Testability.</b> Jis function ke inputs saaf hon aur ek return value ho use test karna aasaan hai: call karo, result compare karo. Yeh aap chapter 8 se karoge.</li>
<li><b>Teamwork.</b> Do engineers do functions par ek saath kaam kar sakte hain bina ek hi lines edit kiye.</li>
<li><b>Detail chhupana (abstraction).</b> Caller ko config kaise banta hai yeh jaanna zaroori nahi, bas kya andar jaata hai aur kya bahar aata hai.</li>
</ul>
<div class="tip"><p><b>Rule of thumb.</b> Ek function, ek kaam, naam verb phrase ho (<code>parse_vlan_list</code>, <code>build_config</code>). Agar use describe karne ke liye "aur" shabd chahiye to split karo. Functions itne chhote rakho ki ek screen par padh sako. Global variables par chhupi nirbharta se bacho: jo function ko chahiye woh parameters mein do.</p></div>

<h3>Modules: related functions rakhne wali files</h3>
<p>Python mein <b>module</b> sirf ek <code>.py</code> file hai. Jab aap related functions <code>vlan_tools.py</code> mein rakhte ho, koi bhi doosri script unhe <code>import</code> se use kar sakti hai. <b>Package</b> modules ka folder hai (ek <code>__init__.py</code> file ke saath). Standard library jo aapne use ki (<code>json</code>, <code>ipaddress</code>, <code>os</code>) doosron ke likhe modules ka collection hai.</p>
<pre class="code"><span class="c"># file: vlan_tools.py</span>
def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

<span class="c"># file: audit.py  (ek alag file)</span>
import vlan_tools                          <span class="c"># poora module lao</span>
from vlan_tools import make_vlan_config    <span class="c"># ya sirf ek function</span>
import ipaddress                           <span class="c"># standard-library module</span>

print(vlan_tools.is_valid_vlan(4095))      <span class="c"># module naam, dot, function</span>
print(ipaddress.ip_address("192.0.2.10").is_private)</pre>
<pre class="out"><span class="hl">False</span>
True</pre>
<p><code>vlan_tools.is_valid_vlan</code> use karne se naam ek <b>namespace</b> mein rehte hain: do modules mein <code>validate</code> naam ka function ho sakta hai bina takraye, kyunki aap <code>vlan_tools.validate</code> aur <code>ip_tools.validate</code> likhte ho.</p>

<h3>Main guard: module jo program bhi hai</h3>
<p>Jab Python file ko seedha chalata hai, ek special variable <code>__name__</code> barabar hota hai <code>"__main__"</code>. Jab file import hoti hai, <code>__name__</code> module ka naam hota hai. Isliye aap aisa block jod sakte ho jo sirf seedha chalane par chale, chhote demo ya tests chalane ke liye perfect.</p>
<pre class="code">def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

if __name__ == "__main__":
    print("self-check:", is_valid_vlan(10), is_valid_vlan(0))</pre>
<pre class="out"><span class="hl">self-check: True False</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Modules aur functions">
<rect x="10" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">vlan_tools.py</text>
<rect x="25" y="45" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="65" text-anchor="middle" class="svg-ink" font-size="12">is_valid_vlan()</text>
<rect x="25" y="85" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="12">make_vlan_config()</text>
<rect x="25" y="125" width="160" height="30" rx="6" fill="#bae6fd"/><text x="105" y="145" text-anchor="middle" class="svg-ink" font-size="12">parse_vlan_list()</text>
<rect x="440" y="10" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">audit.py</text><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="12">import vlan_tools</text>
<rect x="440" y="100" width="190" height="80" rx="10" fill="#fde68a"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">test_vlan.py</text><text x="535" y="150" text-anchor="middle" class="svg-ink" font-size="12">import vlan_tools</text>
<line x1="200" y1="60" x2="438" y2="50" stroke="#64748b" stroke-width="2"/><line x1="200" y1="130" x2="438" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">ek source of truth, kai users</text>
</svg><p class="cap">Ek module, ek baar likha aur fix kiya, asli tool aur uske tests dono ko serve karta hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> Apni file ka naam standard module par rakhna (<code>json.py</code> naam ki file asli <code>json</code> ko chhupa deti hai). <code>return</code> bhoolna jisse caller ko <code>None</code> milta hai. Aisa function likhna jo print bhi kare aur return bhi, jisse testing mushkil hoti hai. "Chal raha hai" soch kar sab kuch ek 900 line ki file mein daal dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Benefits ke shabd yaad rakho: reuse, readability, maintainability, easier testing, collaboration, namespaces. Module ke benefit wale question mein aksar sahi jawab "related code saath rakhta hai aur name clash se bachata hai" hota hai, jabki "code tez chalata hai" distractor hota hai.</p></div>
<p><b>Lab mein.</b> Dono labs mein code aur uske tests AUTO host par ek hi <code>vlan_tools.py</code> mein hain, kyunki lab ka Python aapki ek file ko doosri se import nahi kar sakta. Asli laptop par aap unhe alag karoge: code ke liye <code>vlan_tools.py</code> aur <code>test_vlan_tools.py</code> jo <code>import vlan_tools</code> karti hai.</p>

<div class="scn"><h4>Ek rule, bees copies</h4><p>Ek network team ki har script mein "yeh VLAN allowed hai ya nahi" ki apni copy thi. Jab company ne naye service ke liye VLANs 3000 se 3100 reserve kiye, rule gyaarah scripts mein update hua aur nau mein bhool gaye. Do scripts ab bhi VLAN 3050 access switch par push kar rahi thi. Incident ke baad team ne ek <code>vlan_tools</code> module banaya, copies hataayi aur uske against tests likhe.</p><p><b>Lesson:</b> jo rule ek function mein rehta hai woh ek baar fix hota hai.</p></div>
<div class="iv"><p class="q">"Code ko functions aur modules mein kyun baantte hain?"</p><p>Reuse aur no duplication, kyunki rule ya fix ek jagah rehta hai; readability, kyunki naam intent batate hain; testability, kyunki saaf inputs wale chhote functions check karna aasaan hai; collaboration, kyunki log alag pieces par kaam karte hain; aur namespaces, jo name clash rokte hain. Network example do, jaise ek shared VLAN validator jo kai scripts use karti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Function ek naam wala reusable kaam hai; parameters andar, return value bahar.</li>
<li>DRY: har rule ek jagah rakho.</li>
<li>Module ek .py file hai; package modules ka folder hai; import unhe namespace ke saath lata hai.</li>
<li>Main guard code sirf tab chalata hai jab file seedha execute ho.</li>
<li>Saaf inputs wale chhote functions test karna sabse aasaan hai.</li>
</ul></div>
`}};export{e as default};