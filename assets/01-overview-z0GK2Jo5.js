var e={id:`overview`,h:{en:`Welcome: why functions, files and error handling matter`,hi:`Swagat: functions, files aur error handling kyun zaroori hain`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn three skills that turn a short Python experiment into a script you can trust on a real network. First, <b>functions</b>: write a block of code once and use it for every router. Second, <b>files</b>: save results to disk and read prepared data back. Third, <b>exceptions</b>: read the error message Python prints when something breaks, and make the script carry on when one device is down. At the end you will build a configuration generator and a router checker, exactly like the two labs of this module. This is the Python part of the CCNP Automation (350-901 AUTOCOR) track.</p>
<p><b>Prerequisites.</b> You do not need to have written code before this track, but the two modules before this one are assumed: Python 1 (print, variables, strings and f-strings) and Python 2 (lists, dictionaries, loops and <code>if</code>). If you can explain what <code>for ip in ROUTERS:</code> does, you are ready. Everything else in this module is explained line by line.</p>
<h3>Analogy: a recipe card</h3>
<p>A restaurant does not invent the recipe for butter chicken every time an order arrives. The cook has a <b>recipe card</b>. The ingredients change (500 g or 2 kg of chicken), but the steps stay the same. A <b>function</b> is that recipe card. You write the steps once, give the card a name, and every time you need the dish you say the name and hand over the ingredients. The ingredients you hand over are called <b>arguments</b>. The finished dish you get back is the <b>return value</b>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="A function is a small machine"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Inputs</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">name, ip, desc</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Function</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">build_intf_config</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">list of config lines</text></svg><p class="cap">A function is a small machine</p></div>
<h3>The problem functions solve</h3>
<p>Imagine a company opens a branch and the router needs three LAN interfaces. Each interface needs the same four lines; only the name, the IP address and the description change. Here is the copy-paste way. Read it slowly: <code>print()</code> shows text on the screen, and every line below is one <code>print()</code>.</p>
<pre class="code">print("interface GigabitEthernet0/1")
print(" description LAN-USERS")
print(" ip address 10.10.1.1 255.255.255.0")
print(" no shutdown")
print("interface GigabitEthernet0/2")
print(" description LAN-CCTV")
print(" ip address 10.10.2.1 255.255.255.0")
print(" no shutdown")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown</pre>
<p>It works, and for two interfaces it is fine. Now think about 50 branches with 3 interfaces each. That is 150 copies of the same four lines. If you find a mistake (for example the mask should have been <code>255.255.255.252</code>), you must fix it in 150 places and you will surely miss one. This is how outages are born: not from hard problems, but from tired people repeating the same thing.</p>
<h3>The same job with a function</h3>
<p>Do not worry about every word yet; the next chapters explain each piece. Just notice the shape: the four lines exist <b>once</b>, and the last two lines of the script simply call it twice.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")
    print(" no shutdown")

show_interface("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")
show_interface("GigabitEthernet0/2", "10.10.2.1", "LAN-CCTV")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown</pre>
<p>The output is identical to the copy-paste version. The difference is that a change to the mask is now <b>one edit in one place</b>.</p>
<h3>Why files and error handling come with functions</h3>
<p>Functions make the script short. But a real script also needs to <b>remember</b> things and to <b>survive</b> things:</p>
<ul>
<li>A script forgets everything when it ends. A <b>file</b> is how it keeps a backup, a report or a list of failed devices, and how it reads a device list somebody else prepared.</li>
<li>Real networks are never perfect: a router is rebooting, a password changed, a cable is out. Without protection, the script crashes on router 2 and never reaches routers 3 to 50. <b>try/except</b> lets the script note the problem and continue.</li>
</ul>
<h3>The lab devices you will meet</h3>
<p>In the labs the automation host is called <code>AUTO</code> (IP 10.99.0.100) and the routers are R1, R2 and R3 on a switch, with management addresses 10.99.0.1, 10.99.0.2 and 10.99.0.3 and the SSH login <code>netops</code> / <code>NK@2026</code>. In lab 1 you finish a file called <code>intf.py</code>, build <code>branch.cfg</code> and push it to R1. In lab 2 you repair <code>check.py</code>, which collects the uptime of three routers and writes <code>results.txt</code>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Your path through this module"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Functions</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">def, params, return</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Files</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">read, write, append</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Errors</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">traceback, try/except</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Labs</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">build and repair</text></svg><p class="cap">Your path through this module</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Thinking a function is only for long or clever code. A function is worth it the moment you catch yourself copying a block. Also, beginners often write 200 lines at the top level of a file and then cannot find the bug. Small named functions make bugs easy to find.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show a function with no <code>return</code> and ask what a variable holds after calling it. The answer is <code>None</code>. Remember that <code>print()</code> shows a value and does not give it back.</p></div>
<div class="scn"><h4>Fifty branches, one typo</h4><p>A retail company configured 50 branch routers by pasting the same interface block into a script 50 times. One copy had <code>255.255.255.254</code> instead of <code>255.255.255.252</code>. Eleven days later that branch lost its WAN link after a maintenance window and the team spent two hours finding the one bad copy. After the incident they rewrote the script around one function and one data list. The next mask change took one edit and one run.</p>
<p><b>Lesson:</b> one copy of the logic means one place to fix, and one place to review.</p></div>
<div class="iv"><p class="q">"Why would a network engineer use functions in an automation script?"</p><p>Functions remove duplication, so a fix is made once instead of in many places. They give the code readable names such as <code>build_intf_config</code>, they can be tested on their own, and the same function can be reused by many scripts. Say that the arguments change from device to device while the logic stays the same.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A function is a named block of code you write once and call many times.</li>
<li>Arguments go in, a return value comes out.</li>
<li>Copy-pasted config lines are the main source of automation typos.</li>
<li>Files let a script keep results; try/except lets it survive a dead device.</li>
<li>The two labs use AUTO, R1 to R3, and SSH login netops / NK@2026.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap teen skills seekhoge jo ek chhote Python experiment ko aise script mein badal deti hain jis par real network mein bharosa kiya ja sake. Pehli, <b>functions</b>: code ka ek block ek baar likho aur har router ke liye use karo. Doosri, <b>files</b>: results disk par save karo aur taiyaar data wapas padho. Teesri, <b>exceptions</b>: kuch toote to Python jo error message print karta hai use padhna, aur ek device down ho tab bhi script ko aage badhana. Aakhir mein aap ek configuration generator aur ek router checker banaoge, bilkul is module ke do labs jaisa. Yeh CCNP Automation (350-901 AUTOCOR) track ka Python hissa hai.</p>
<p><b>Prerequisites.</b> Is track se pehle aapne code likha ho yeh zaroori nahi, lekin is module se pehle ke do modules maane gaye hain: Python 1 (print, variables, strings aur f-strings) aur Python 2 (lists, dictionaries, loops aur <code>if</code>). Agar aap samjha sakte ho ki <code>for ip in ROUTERS:</code> kya karta hai, to aap ready ho. Is module ki baaki sab cheezein line by line samjhayi gayi hain.</p>
<h3>Analogy: recipe card</h3>
<p>Restaurant har order par butter chicken ki recipe naye sire se nahi banata. Cook ke paas ek <b>recipe card</b> hota hai. Ingredients badalte hain (500 g ya 2 kg chicken), lekin steps wahi rehte hain. <b>Function</b> wahi recipe card hai. Steps ek baar likho, card ko naam do, aur jab bhi dish chahiye ho naam bolo aur ingredients de do. Jo ingredients aap dete ho unhe <b>arguments</b> kehte hain. Jo tayyar dish wapas milti hai woh <b>return value</b> hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Function ek chhoti machine hai"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Inputs</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">name, ip, desc</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Function</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">build_intf_config</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">config lines ki list</text></svg><p class="cap">Function ek chhoti machine hai</p></div>
<h3>Function kaun si problem solve karta hai</h3>
<p>Socho company ek branch kholti hai aur router ko teen LAN interfaces chahiye. Har interface ko wahi chaar lines chahiye; sirf name, IP address aur description badalte hain. Yeh copy-paste wala tareeka hai. Dheere padho: <code>print()</code> screen par text dikhata hai, aur neeche ki har line ek <code>print()</code> hai.</p>
<pre class="code">print("interface GigabitEthernet0/1")
print(" description LAN-USERS")
print(" ip address 10.10.1.1 255.255.255.0")
print(" no shutdown")
print("interface GigabitEthernet0/2")
print(" description LAN-CCTV")
print(" ip address 10.10.2.1 255.255.255.0")
print(" no shutdown")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown</pre>
<p>Yeh chalta hai, aur do interfaces ke liye theek hai. Ab socho 50 branches, har ek mein 3 interfaces. Matlab wahi chaar lines ki 150 copies. Mistake mil jaaye (maan lo mask <code>255.255.255.252</code> hona chahiye tha), to 150 jagah fix karna padega aur ek zaroor chhoot jaayegi. Outages aise hi paida hote hain: mushkil problems se nahi, balki thake hue logon ke wahi cheez baar baar karne se.</p>
<h3>Wahi kaam function ke saath</h3>
<p>Abhi har shabd ki chinta mat karo; agle chapters har hissa samjhayenge. Bas shape dekho: chaar lines <b>ek baar</b> hain, aur script ki aakhri do lines use do baar call karti hain.</p>
<pre class="code">def show_interface(name, ip, desc):
    print("interface " + name)
    print(" description " + desc)
    print(" ip address " + ip + " 255.255.255.0")
    print(" no shutdown")

show_interface("GigabitEthernet0/1", "10.10.1.1", "LAN-USERS")
show_interface("GigabitEthernet0/2", "10.10.2.1", "LAN-CCTV")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">interface GigabitEthernet0/1
 description LAN-USERS
 ip address 10.10.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 description LAN-CCTV
 ip address 10.10.2.1 255.255.255.0
 no shutdown</pre>
<p>Output copy-paste version jaisa hi hai. Fark yeh hai ki mask badalna ab <b>ek jagah ka ek edit</b> hai.</p>
<h3>Functions ke saath files aur error handling kyun aate hain</h3>
<p>Functions script ko chhota banate hain. Lekin real script ko cheezein <b>yaad rakhni</b> aur <b>jhelni</b> bhi padti hain:</p>
<ul>
<li>Script khatam hote hi sab bhool jaata hai. <b>File</b> se woh backup, report ya failed devices ki list rakhta hai, aur kisi aur ki banayi device list padhta hai.</li>
<li>Real networks perfect nahi hote: router reboot ho raha hai, password badal gaya, cable nikli hai. Protection ke bina script router 2 par crash hota hai aur router 3 se 50 tak kabhi nahi pahunchta. <b>try/except</b> script ko problem note karke aage badhne deta hai.</li>
</ul>
<h3>Lab devices jinse aap milenge</h3>
<p>Labs mein automation host ka naam <code>AUTO</code> (IP 10.99.0.100) hai aur routers R1, R2 aur R3 ek switch par hain, management addresses 10.99.0.1, 10.99.0.2 aur 10.99.0.3 aur SSH login <code>netops</code> / <code>NK@2026</code>. Lab 1 mein aap <code>intf.py</code> naam ki file poori karte ho, <code>branch.cfg</code> banate ho aur R1 par push karte ho. Lab 2 mein aap <code>check.py</code> repair karte ho, jo teen routers ka uptime collect karke <code>results.txt</code> likhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Is module mein aapka raasta"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Functions</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">def, params, return</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Files</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">read, write, append</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Errors</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">traceback, try/except</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Labs</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">banao aur repair karo</text></svg><p class="cap">Is module mein aapka raasta</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Yeh sochna ki function sirf lambe ya clever code ke liye hota hai. Jaise hi aap ek block copy karte pakde jao, function ka time aa gaya. Aur beginners aksar ek file ke top level par 200 lines likh dete hain aur phir bug nahi dhoondh paate. Chhote named functions bug dhoondhna aasaan bana dete hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam ek aisa function dikha sakta hai jisme <code>return</code> nahi hai aur poochta hai function call ke baad variable mein kya hai. Jawab <code>None</code> hai. Yaad rakho <code>print()</code> value dikhata hai, wapas nahi deta.</p></div>
<div class="scn"><h4>Pachaas branches, ek typo</h4><p>Ek retail company ne 50 branch routers ko ek hi interface block 50 baar script mein paste karke configure kiya. Ek copy mein <code>255.255.255.252</code> ki jagah <code>255.255.255.254</code> tha. Gyarah din baad maintenance window ke baad us branch ka WAN link chala gaya aur team ne ek kharab copy dhoondhne mein do ghante lagaye. Incident ke baad unhone script ek function aur ek data list ke around dobara likha. Agla mask change ek edit aur ek run mein ho gaya.</p>
<p><b>Lesson:</b> logic ki ek copy matlab fix karne ki ek jagah, aur review karne ki ek jagah.</p></div>
<div class="iv"><p class="q">"Network engineer automation script mein functions kyun use karta hai?"</p><p>Functions duplication hatate hain, isliye fix kai jagah ke bajay ek baar hota hai. Woh code ko <code>build_intf_config</code> jaise readable naam dete hain, unhe alag se test kiya ja sakta hai, aur ek function kai scripts reuse kar sakte hain. Batao ki arguments device ke hisaab se badalte hain jabki logic wahi rehta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Function ek named code block hai jo ek baar likhte ho aur kai baar call karte ho.</li>
<li>Arguments andar jaate hain, return value bahar aati hai.</li>
<li>Copy-paste ki hui config lines automation typos ka sabse bada source hain.</li>
<li>Files se script results rakhta hai; try/except se woh dead device jhel leta hai.</li>
<li>Dono labs AUTO, R1 se R3 aur SSH login netops / NK@2026 use karte hain.</li>
</ul></div>
`}};export{e as default};