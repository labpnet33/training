var e={id:`programming-basics`,h:{en:`Programming for the never-coded: variables, decisions, loops and functions`,hi:`Kabhi code na likhne walon ke liye programming: variables, decisions, loops aur functions`},body:{en:`
<p>Automation, bash scripts and Ansible playbooks look different on the surface, but they all rest on <b>four ideas</b>: a <b>variable</b>, a <b>decision</b>, a <b>loop</b> and a <b>function</b>. You already use all four on routers. This chapter shows them in plain words, with the router version next to the code version, so that later modules feel familiar.</p>

<h3>Analogy: a recipe card</h3>
<p>A program is a recipe card. It lists steps in order, a computer follows them from the top, and it does exactly what is written, never more. Your skill is writing clear steps, which you already do when you write a change plan.</p>

<h3>1. Variable: a labelled box</h3>
<p>A <b>variable</b> is a name that holds a value, like the label on a box. On a router you name things too: <code>hostname R1</code>, an ACL called <code>MGMT</code>. In Python:</p>
<pre class="code">router = "R1"
vlan = 10
print(router, vlan)</pre>
<pre class="out">R1 10</pre>
<p>The equals sign here does not mean "is equal to". It means <b>store the value on the right under the name on the left</b>. Text goes in quotation marks (a <b>string</b>); numbers do not.</p>

<h3>2. Decision: if this, then that</h3>
<p>You already think this way: "if the interface is down, check the cable". An ACL is a list of decisions too: if the packet matches, permit it, otherwise go to the next line.</p>
<pre class="code">status = "down"
if status == "down":
    print("Check the cable")
else:
    print("All good")</pre>
<pre class="out">Check the cable</pre>
<p>Two equals signs, <code>==</code>, mean "compare". One means "store". The colon and the <b>indented</b> lines belong to the <code>if</code>. In Python the indentation is part of the language, like the nesting of sub-commands under <code>interface</code> on a router.</p>

<h3>3. Loop: do it for every item</h3>
<p>On a router, <code>interface range gi0/1 - 4</code> applies the same lines to four ports. A <b>loop</b> does the same for a list of anything:</p>
<pre class="code">down = ["R3"]
for name in ["R1", "R2", "R3"]:
    if name in down:
        print(name, "is DOWN")
    else:
        print(name, "is up")</pre>
<pre class="out">R1 is up
R2 is up
R3 is DOWN</pre>
<p>Read it aloud: "for each name in the list, if the name is in the down list, say DOWN, otherwise say up". Loops are why automation scales: five routers or five hundred, the code is the same.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Loop with a decision inside">
<rect x="15" y="50" width="120" height="50" rx="10" fill="#bae6fd"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="13">List</text><text x="75" y="89" text-anchor="middle" class="svg-muted" font-size="12">R1, R2, R3</text>
<rect x="185" y="50" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="250" y="72" text-anchor="middle" class="svg-ink" font-size="13">Take the next</text><text x="250" y="89" text-anchor="middle" class="svg-muted" font-size="12">name</text>
<rect x="365" y="50" width="110" height="50" rx="10" fill="#fde68a"/><text x="420" y="72" text-anchor="middle" class="svg-ink" font-size="13">Is it down?</text><text x="420" y="89" text-anchor="middle" class="svg-muted" font-size="12">decision</text>
<rect x="525" y="15" width="100" height="40" rx="10" fill="#fed7aa"/><text x="575" y="40" text-anchor="middle" class="svg-ink" font-size="13">DOWN</text>
<rect x="525" y="95" width="100" height="40" rx="10" fill="#ddd6fe"/><text x="575" y="120" text-anchor="middle" class="svg-ink" font-size="13">up</text>
<line x1="135" y1="75" x2="185" y2="75" stroke="#64748b" stroke-width="2"/><line x1="315" y1="75" x2="365" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="475" y1="65" x2="525" y2="38" stroke="#64748b" stroke-width="2"/><line x1="475" y1="85" x2="525" y2="115" stroke="#64748b" stroke-width="2"/>
<path d="M 575 135 L 575 145 L 250 145 L 250 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">The loop repeats the decision for every name in the list.</p></div>

<h3>4. Function: a macro with a name</h3>
<p>A <b>function</b> is a named block of steps you can reuse, like a Cisco macro or a config template you paste on every access switch.</p>
<pre class="code">def report(name, state):
    print(name, "is", state)

report("R1", "up")
report("R3", "DOWN")</pre>
<pre class="out">R1 is up
R3 is DOWN</pre>
<p><code>def</code> defines it. The names in brackets are its <b>inputs</b> (called parameters). Nothing runs until you call it by name with real values.</p>

<h3>The same ideas in bash</h3>
<pre class="code">for name in R1 R2 R3; do
  if [ "$name" = "R3" ]; then
    echo "$name is DOWN"
  else
    echo "$name is up"
  fi
done</pre>
<p>Different spelling, same four ideas: a variable (<code>name</code>, read with a dollar sign), a loop, a decision. The spaces inside the square brackets matter in bash. Ansible hides the same ideas in YAML: <code>loop:</code> is a loop, <code>when:</code> is a decision, <code>vars:</code> are variables.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) One <code>=</code> where you meant <code>==</code>. (2) Forgetting the colon after <code>if</code>, <code>for</code> or <code>def</code>. (3) Wrong indentation: Python reports <i>IndentationError</i>. (4) Forgetting the quotation marks around text: Python thinks R1 is a variable name. (5) Being scared of the red error message. It names the file, the line number and the problem: read it from the bottom.</p></div>
<div class="exam"><p><b>Interview trap.</b> Asked "what is idempotent automation", do not say "it runs fast". Say that running it twice gives the same result and the second run changes nothing.</p></div>

<div class="scn"><h4>Eight hundred ports, one afternoon</h4><p>A college wanted every access port to have the same description and storm-control setting. By hand, it was two days of typing with typos. An engineer wrote one loop over a list of switches and a decision that skipped trunk ports. It finished before lunch and the second run showed zero changes.</p><p><b>Lesson:</b> the logic is the same as the one you use at the CLI; the loop just never gets tired.</p></div>

<div class="iv"><p class="q">"You have never programmed. How would you start automating network tasks?"</p><p>Say you would start by writing the task as plain steps, then turn each step into one of four building blocks: variable, decision, loop or function. Pick a read-only task first, such as collecting <code>show version</code> from every device, and check the result by hand before you ever push configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A variable is a labelled box; = stores, == compares.</li>
<li>A decision (if, else) chooses between actions, like an ACL line.</li>
<li>A loop repeats steps for every item, like interface range.</li>
<li>A function is a named, reusable block, like a macro.</li>
<li>Bash, Python and Ansible spell the same four ideas differently.</li>
</ul></div>
`,hi:`
<p>Automation, bash scripts aur Ansible playbooks upar se alag dikhte hain, lekin sab <b>chaar ideas</b> par tike hain: <b>variable</b>, <b>decision</b>, <b>loop</b> aur <b>function</b>. Aap routers par yeh chaaron pehle se use karte ho. Yeh chapter unhe saadi bhasha mein dikhata hai, router wala version code wale version ke saath, taaki aage ke modules jaane-pehchaane lagein.</p>

<h3>Analogy: recipe card</h3>
<p>Program ek recipe card hai. Usme steps order mein likhe hote hain, computer unhe upar se follow karta hai, aur bilkul wahi karta hai jo likha hai, na zyada. Aapki skill saaf steps likhna hai, jo aap change plan likhte waqt pehle se karte ho.</p>

<h3>1. Variable: label laga dabba</h3>
<p><b>Variable</b> ek naam hai jisme value rakhi hoti hai, dabbe par laga label jaisa. Router par bhi aap cheezon ko naam dete ho: <code>hostname R1</code>, <code>MGMT</code> naam ki ACL. Python mein:</p>
<pre class="code">router = "R1"
vlan = 10
print(router, vlan)</pre>
<pre class="out">R1 10</pre>
<p>Yahan equals sign ka matlab "barabar hai" nahi hai. Matlab hai <b>right ki value ko left ke naam se store karo</b>. Text quotation marks mein jaata hai (<b>string</b>); numbers mein nahi.</p>

<h3>2. Decision: agar yeh, to woh</h3>
<p>Aap pehle se aise sochte ho: "agar interface down hai, to cable check karo". ACL bhi decisions ki list hai: packet match kare to permit, warna agli line.</p>
<pre class="code">status = "down"
if status == "down":
    print("Check the cable")
else:
    print("All good")</pre>
<pre class="out">Check the cable</pre>
<p>Do equals, <code>==</code>, matlab "compare karo". Ek equals matlab "store karo". Colon aur <b>indent</b> wali lines <code>if</code> ki hain. Python mein indentation language ka hissa hai, jaise router par <code>interface</code> ke neeche sub-commands ka nesting.</p>

<h3>3. Loop: har item ke liye karo</h3>
<p>Router par <code>interface range gi0/1 - 4</code> chaar ports par wahi lines laga deta hai. <b>Loop</b> kisi bhi list ke liye wahi karta hai:</p>
<pre class="code">down = ["R3"]
for name in ["R1", "R2", "R3"]:
    if name in down:
        print(name, "is DOWN")
    else:
        print(name, "is up")</pre>
<pre class="out">R1 is up
R2 is up
R3 is DOWN</pre>
<p>Zor se padho: "list ke har name ke liye, agar name down list mein hai to DOWN bolo, warna up". Loops ki wajah se automation scale hota hai: paanch router ho ya paanch sau, code wahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Loop ke andar decision">
<rect x="15" y="50" width="120" height="50" rx="10" fill="#bae6fd"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="13">List</text><text x="75" y="89" text-anchor="middle" class="svg-muted" font-size="12">R1, R2, R3</text>
<rect x="185" y="50" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="250" y="72" text-anchor="middle" class="svg-ink" font-size="13">Agla naam lo</text><text x="250" y="89" text-anchor="middle" class="svg-muted" font-size="12">name</text>
<rect x="365" y="50" width="110" height="50" rx="10" fill="#fde68a"/><text x="420" y="72" text-anchor="middle" class="svg-ink" font-size="13">Down hai?</text><text x="420" y="89" text-anchor="middle" class="svg-muted" font-size="12">decision</text>
<rect x="525" y="15" width="100" height="40" rx="10" fill="#fed7aa"/><text x="575" y="40" text-anchor="middle" class="svg-ink" font-size="13">DOWN</text>
<rect x="525" y="95" width="100" height="40" rx="10" fill="#ddd6fe"/><text x="575" y="120" text-anchor="middle" class="svg-ink" font-size="13">up</text>
<line x1="135" y1="75" x2="185" y2="75" stroke="#64748b" stroke-width="2"/><line x1="315" y1="75" x2="365" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="475" y1="65" x2="525" y2="38" stroke="#64748b" stroke-width="2"/><line x1="475" y1="85" x2="525" y2="115" stroke="#64748b" stroke-width="2"/>
<path d="M 575 135 L 575 145 L 250 145 L 250 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Loop list ke har naam ke liye decision dohrata hai.</p></div>

<h3>4. Function: naam wala macro</h3>
<p><b>Function</b> steps ka naam wala block hai jo aap dobara use kar sakte ho, Cisco macro ya us config template jaisa jo aap har access switch par paste karte ho.</p>
<pre class="code">def report(name, state):
    print(name, "is", state)

report("R1", "up")
report("R3", "DOWN")</pre>
<pre class="out">R1 is up
R3 is DOWN</pre>
<p><code>def</code> use define karta hai. Bracket ke naam uske <b>inputs</b> hain (parameters). Jab tak aap real values ke saath naam se call nahi karte, kuch nahi chalta.</p>

<h3>Wahi ideas bash mein</h3>
<pre class="code">for name in R1 R2 R3; do
  if [ "$name" = "R3" ]; then
    echo "$name is DOWN"
  else
    echo "$name is up"
  fi
done</pre>
<p>Spelling alag, chaar ideas wahi: variable (<code>name</code>, dollar sign se padha jaata hai), loop, decision. bash mein square brackets ke andar ke spaces matter karte hain. Ansible wahi ideas YAML mein chhupata hai: <code>loop:</code> loop hai, <code>when:</code> decision hai, <code>vars:</code> variables hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>==</code> ki jagah ek <code>=</code>. (2) <code>if</code>, <code>for</code> ya <code>def</code> ke baad colon bhoolna. (3) Galat indentation: Python <i>IndentationError</i> deta hai. (4) Text ke aaspaas quotation marks bhoolna: Python R1 ko variable ka naam samajhta hai. (5) Laal error message se darna. Woh file, line number aur problem batata hai: neeche se padho.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Idempotent automation kya hai" poochhe to "yeh tez chalta hai" mat kaho. Kaho ki do baar chalane par same result aata hai aur doosri run kuch nahi badalti.</p></div>

<div class="scn"><h4>Aath sau ports, ek dopahar</h4><p>Ek college chahta tha ki har access port par same description aur storm-control setting ho. Haath se yeh do din ki typing thi aur typos ke saath. Ek engineer ne switches ki list par ek loop likha aur ek decision jo trunk ports ko skip karta tha. Lunch se pehle khatam, aur doosri run mein zero changes.</p><p><b>Lesson:</b> logic wahi hai jo aap CLI par use karte ho; loop bas kabhi thakta nahi.</p></div>

<div class="iv"><p class="q">"Aapne kabhi programming nahi ki. Network tasks automate karna kaise shuru karoge?"</p><p>Kaho ki aap task ko saaf steps mein likhoge, phir har step ko chaar building blocks mein se ek banaoge: variable, decision, loop ya function. Pehle read-only task chuno, jaise har device se <code>show version</code> collect karna, aur configuration push karne se pehle result haath se check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable label laga dabba hai; = store karta hai, == compare.</li>
<li>Decision (if, else) actions mein se chunta hai, ACL line jaisa.</li>
<li>Loop har item ke liye steps dohrata hai, interface range jaisa.</li>
<li>Function naam wala reusable block hai, macro jaisa.</li>
<li>Bash, Python aur Ansible wahi chaar ideas alag spelling mein likhte hain.</li>
</ul></div>
`}};export{e as default};