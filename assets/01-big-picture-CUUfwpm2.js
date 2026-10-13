var e={id:`big-picture`,h:{en:`Python 1: what you will learn and the big picture`,hi:`Python 1: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn.</b> This module teaches the very first building blocks of Python, one small idea per chapter: showing text with <code>print</code>, storing values in <b>variables</b>, the difference between text and numbers, cleaning text with <b>string methods</b>, building configuration lines with <b>f-strings</b>, yes/no values called <b>booleans</b>, and how to read and fix the three errors every beginner meets. You do not need any programming background. If you finished the module "What is network automation?", you have already run a script; here you learn to write the lines yourself.</p>
<p><b>Prerequisites.</b> Basic networking: interface names such as <code>GigabitEthernet0/1</code>, VLAN numbers and IP addresses. Everything in this module runs on the lab host <code>AUTO</code>; no routers are needed.</p>
<h3>Analogy: labelled jars and a mail-merge letter</h3>
<p>Picture a kitchen shelf with jars. Each jar has a label (<code>salt</code>, <code>sugar</code>) and something inside. A <b>variable</b> is a jar: a name on the outside, a value inside. Now picture a printed letter that says "Dear ____, your VLAN is ____". A clerk fills the blanks from a list. That is an <b>f-string</b>: a sentence with blanks that Python fills from your jars. Together they let one small script produce the exact configuration for any port, any VLAN, any site.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Values to config text">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Values</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">hostname, vlan</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">named jars</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">f-string</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">template + jars</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Config text</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">ready to paste</text>
</svg><p class="cap">The pipeline of this module: values go into variables, an f-string fills a template, config text comes out.</p></div>
<h3>A first look at the lab script</h3>
<p>In Lab 1 you get <code>hello_router.py</code>. Read it now even if you do not understand every word yet; by chapter 6 you will understand all of it. Lines starting with <code>#</code> are comments.</p>
<pre class="code"><span class="c"># hello_router.py - build interface config lines with Python</span>
<span class="c"># A VARIABLE is a named box that stores a value.</span>
interface = "GigabitEthernet0/1"   <span class="c"># a string (text): always inside quotes</span>
vlan = 10                          <span class="c"># an integer (whole number): no quotes</span>
site = "  pune  "                  <span class="c"># messy text with extra spaces</span>

<span class="c"># print() shows something on the screen</span>
print("Building config...")

<span class="c"># .strip() removes spaces at both ends, .upper() makes CAPITAL letters</span>
clean_site = site.strip().upper()

<span class="c"># f-string: put f before the quote, then {name} is replaced by its value</span>
print(f"interface {interface}")
print(f" description Link to {clean_site} - VLAN {vlan}")
print(" switchport mode access")
print(f" switchport access vlan {vlan}")</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/1
 description Link to PUNE - VLAN 10
 switchport mode access
 switchport access vlan 10</pre>
<p>Five short lines of output came from seventeen lines of script. Change one variable, say <code>vlan = 20</code>, and the text changes with it. You never retype the configuration.</p>
<h3>The eight chapters ahead</h3>
<ol>
<li><code>print</code> and comments</li>
<li>Variables</li>
<li>Strings, integers and types</li>
<li>String methods</li>
<li>f-strings</li>
<li>Numbers, maths and booleans</li>
<li>Fixing errors (the report lab)</li>
<li>Summary and checklist</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Without Python you would type <code>description Link to PUNE - VLAN 10</code> for each port, changing site and VLAN by hand 48 times on a stack. With Python you write the sentence once and let the variables change.</p></div>
<div class="warn"><p><b>Common mistake.</b> Trying to memorise syntax. Programmers look things up all the time. Aim to understand the idea; the exact spelling comes with practice, and Python tells you when you slip.</p></div>
<div class="exam"><p><b>Exam trap.</b> The 350-901 exam shows short Python snippets and asks what they print, or what is wrong with them. Being able to read variables, strings and f-strings quickly is the foundation for every later question.</p></div>
<div class="scn"><h4>The 48-port switch stack</h4><p>A branch needed 48 access ports labelled with a site name and a VLAN. An engineer who knew only the CLI typed 48 descriptions and mixed up two VLANs. A colleague wrote a seven-line Python script with a site variable and a VLAN variable and printed all 48 correct descriptions in one run, which the first engineer then pasted into the switch.</p><p><b>Lesson:</b> variables plus a template turn repetition into one reviewed line.</p></div>
<div class="iv"><p class="q">"Why do network engineers generate configuration text with a script?"</p><p>Because configuration is mostly the same pattern with a few values that change. A script keeps the pattern in one place and fills the changing values from variables, so output is consistent, quick to produce and easy to review. It also avoids copy-and-paste mistakes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A variable is a named jar holding a value; an f-string fills a template from your jars.</li>
<li>This module runs entirely on the AUTO host; no routers needed.</li>
<li>One small idea per chapter: print, variables, types, methods, f-strings, booleans, errors.</li>
<li>Errors are normal and Python explains them.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh module Python ke bilkul pehle building blocks sikhata hai, har chapter mein ek chhota idea: <code>print</code> se text dikhana, <b>variables</b> mein values rakhna, text aur numbers ka fark, <b>string methods</b> se text saaf karna, <b>f-strings</b> se configuration lines banana, haan/na values jinhe <b>booleans</b> kehte hain, aur woh teen errors padhna aur fix karna jo har beginner ko milte hain. Aapko programming background nahi chahiye. Agar aapne "What is network automation?" module kiya hai, to aap ek script chala chuke ho; yahan aap lines khud likhna seekhte ho.</p>
<p><b>Prerequisites.</b> Basic networking: <code>GigabitEthernet0/1</code> jaise interface names, VLAN numbers aur IP addresses. Is module mein sab kuch lab host <code>AUTO</code> par chalta hai; routers ki zaroorat nahi.</p>
<h3>Analogy: label lage jars aur mail-merge letter</h3>
<p>Kitchen ki shelf par jars socho. Har jar par label (<code>salt</code>, <code>sugar</code>) aur andar kuch hota hai. <b>Variable</b> ek jar hai: bahar naam, andar value. Ab ek printed letter socho jisme likha hai "Dear ____, aapka VLAN ____ hai". Clerk list se blanks bharta hai. Yahi <b>f-string</b> hai: blanks wala sentence jise Python aapke jars se bharta hai. Dono milkar ek chhote script ko kisi bhi port, VLAN aur site ki exact configuration banane dete hain.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Values to config text">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Values</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">hostname, vlan</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">naam wale jars</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">f-string</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">template + jars</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Config text</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">paste-ready</text>
</svg><p class="cap">Is module ki pipeline: values variables mein jaati hain, f-string template bharti hai, config text bahar aata hai.</p></div>
<h3>Lab script ki pehli jhalak</h3>
<p>Lab 1 mein aapko <code>hello_router.py</code> milti hai. Ise abhi padho chahe har word samajh na aaye; chapter 6 tak aap sab samajh jaoge. <code>#</code> se shuru hone wali lines comments hain.</p>
<pre class="code"><span class="c"># hello_router.py - build interface config lines with Python</span>
<span class="c"># A VARIABLE is a named box that stores a value.</span>
interface = "GigabitEthernet0/1"   <span class="c"># a string (text): always inside quotes</span>
vlan = 10                          <span class="c"># an integer (whole number): no quotes</span>
site = "  pune  "                  <span class="c"># messy text with extra spaces</span>

<span class="c"># print() shows something on the screen</span>
print("Building config...")

<span class="c"># .strip() removes spaces at both ends, .upper() makes CAPITAL letters</span>
clean_site = site.strip().upper()

<span class="c"># f-string: put f before the quote, then {name} is replaced by its value</span>
print(f"interface {interface}")
print(f" description Link to {clean_site} - VLAN {vlan}")
print(" switchport mode access")
print(f" switchport access vlan {vlan}")</pre>
<pre class="out">AUTO&gt; python3 hello_router.py
Building config...
interface GigabitEthernet0/1
 description Link to PUNE - VLAN 10
 switchport mode access
 switchport access vlan 10</pre>
<p>Seventeen lines ke script se paanch chhoti output lines aayi. Ek variable badlo, jaise <code>vlan = 20</code>, aur text uske saath badal jaata hai. Aapko configuration dobara type nahi karni padti.</p>
<h3>Aage ke aath chapters</h3>
<ol>
<li><code>print</code> aur comments</li>
<li>Variables</li>
<li>Strings, integers aur types</li>
<li>String methods</li>
<li>f-strings</li>
<li>Numbers, maths aur booleans</li>
<li>Errors fix karna (report lab)</li>
<li>Summary aur checklist</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Python ke bina aap har port ke liye <code>description Link to PUNE - VLAN 10</code> type karoge, site aur VLAN 48 baar haath se badalte hue. Python mein sentence ek baar likhte ho aur variables badalte rehte hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Syntax ratne ki koshish karna. Programmers hamesha cheezein dekhte rehte hain. Idea samajhne par dhyan do; exact spelling practice se aati hai, aur galti hone par Python khud batata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 350-901 exam chhote Python snippets dikhata hai aur poochta hai ki woh kya print karenge, ya unmein kya galat hai. Variables, strings aur f-strings jaldi padh pana har aage ke sawaal ki neev hai.</p></div>
<div class="scn"><h4>48-port switch stack</h4><p>Ek branch ko 48 access ports chahiye the, site name aur VLAN ke label ke saath. Sirf CLI jaanne wale engineer ne 48 descriptions type kiye aur do VLANs mix kar diye. Ek colleague ne sat lines ka Python script likha jisme site variable aur VLAN variable the, aur ek run mein saare 48 sahi descriptions print kiye, jo pehle engineer ne switch mein paste kiye.</p><p><b>Lesson:</b> variables aur template repetition ko ek reviewed line mein badal dete hain.</p></div>
<div class="iv"><p class="q">"Network engineers configuration text script se kyun generate karte hain?"</p><p>Kyunki configuration zyada tar wahi pattern hoti hai jisme kuch values badalti hain. Script pattern ko ek jagah rakhta hai aur badalti values variables se bharta hai, isliye output consistent, jaldi banne wala aur review mein aasaan hota hai. Isse copy-paste ki galtiyan bhi bachti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable ek naam wala jar hai jisme value hoti hai; f-string aapke jars se template bharti hai.</li>
<li>Yeh module poori tarah AUTO host par chalta hai; routers ki zaroorat nahi.</li>
<li>Har chapter mein ek chhota idea: print, variables, types, methods, f-strings, booleans, errors.</li>
<li>Errors normal hain aur Python unhe samjhata hai.</li>
</ul></div>
`}};export{e as default};