var e={id:`anatomy`,h:{en:`Anatomy of a template: Values, states and rules`,hi:`Template ki anatomy: Values, states aur rules`},body:{en:`
<p><b>The idea of this chapter:</b> a TextFSM template is a small text file with only two parts. The first part says <i>what</i> to capture. The second part says <i>when</i>. After this chapter you can read any template you meet, and write the first template of Lab 1.</p>

<h3>Analogy: a form with boxes</h3>
<p>Think of a printed form. The boxes (name, date, amount) are the <b>Values</b>. The instructions for the clerk ("when you see a line that looks like an invoice row, copy the three boxes and file the row") are the <b>rules</b>. Rules live inside <b>states</b>, which are like the sections of the form: "header section", "table section".</p>

<h3>The Lab 1 template, line by line</h3>
<p>This is the file <code>ipbrief.textfsm</code> that you write in Lab 1. It parses <code>show ip interface brief</code>.</p>
<pre class="code">Value Required INTF (\\S+)
Value IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)
Value STATUS (up|down|administratively down)
Value PROTO (up|down)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<ul>
<li><b>Value line</b>: the word <code>Value</code>, optional options, a field <b>name</b>, and a <b>regular expression in parentheses</b> that matches the field. <code>INTF</code> is any run of non-space characters. <code>IP</code> is four numbers separated by dots, or the word <code>unassigned</code>.</li>
<li><b>Blank line</b>: it ends the list of Values. It is required.</li>
<li><b>State name</b> (<code>Start</code>): a word at the very start of the line, with no spaces before it. Every template must have a state called <code>Start</code>.</li>
<li><b>Rule line</b>: indented by at least one space, and it must begin with <code>^</code>, which means "from the start of the line".</li>
<li><code>&#36;{INTF}</code> inside a rule is replaced by the Value's own regular expression, and whatever it matches is saved in that field.</li>
<li><code>\\s+</code> means "one or more spaces". <code>\\w+</code> means "one or more letters or digits", used here to skip the OK? and Method columns that we do not need.</li>
<li><code>-&gt; Record</code> is the <b>action</b> after the arrow: save the current Values as one row.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One line of show ip interface brief split into the Values INTF, IP, skipped columns, STATUS and PROTO">
<text x="10" y="22" class="svg-muted" font-size="12">One line of text:</text>
<rect x="10" y="32" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">GigabitEthernet0/1</text>
<rect x="165" y="32" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="210" y="54" text-anchor="middle" class="svg-ink" font-size="12">unassigned</text>
<rect x="260" y="32" width="40" height="34" rx="6" fill="#e2e8f0"/><text x="280" y="54" text-anchor="middle" class="svg-ink" font-size="12">YES</text>
<rect x="305" y="32" width="55" height="34" rx="6" fill="#e2e8f0"/><text x="332" y="54" text-anchor="middle" class="svg-ink" font-size="12">unset</text>
<rect x="365" y="32" width="170" height="34" rx="6" fill="#fde68a"/><text x="450" y="54" text-anchor="middle" class="svg-ink" font-size="12">administratively down</text>
<rect x="540" y="32" width="90" height="34" rx="6" fill="#ddd6fe"/><text x="585" y="54" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<text x="85" y="92" text-anchor="middle" class="svg-accent" font-size="12">INTF</text><text x="210" y="92" text-anchor="middle" class="svg-accent" font-size="12">IP</text><text x="332" y="92" text-anchor="middle" class="svg-muted" font-size="12">skipped (\\w+)</text><text x="450" y="92" text-anchor="middle" class="svg-accent" font-size="12">STATUS</text><text x="585" y="92" text-anchor="middle" class="svg-accent" font-size="12">PROTO</text>
<line x1="85" y1="68" x2="85" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="68" x2="210" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="332" y1="68" x2="332" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="450" y1="68" x2="450" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="585" y1="68" x2="585" y2="80" stroke="#64748b" stroke-width="1.5"/>
<rect x="10" y="112" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">row = ['GigabitEthernet0/1', 'unassigned', 'administratively down', 'down']</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="11">after -&gt; Record the Values become one row in the result</text>
</svg><p class="cap">The rule matches the whole line; the Values are the parts we keep.</p></div>

<h3>Run it</h3>
<p>The lab gives you <code>parse_one.py</code>, which runs any template over any text file. You will study how it works in chapter 5; for now just run it.</p>
<pre class="out">AUTO01$ python3 parse_one.py ipbrief.textfsm r1_ipbrief.txt
<span class="hl">['INTF', 'IP', 'STATUS', 'PROTO']</span>
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
['GigabitEthernet0/1', 'unassigned', 'administratively down', 'down']
['GigabitEthernet0/2', 'unassigned', 'administratively down', 'down']
['GigabitEthernet0/3', 'unassigned', 'administratively down', 'down']
['Loopback0', '1.1.1.1', 'up', 'up']</pre>
<p>The first line is the <b>header</b>: the field names in the order the Values were declared. Below it is one row per interface. The header line of the router output ("Interface IP-Address OK? ...") produced no row, because no rule matched it. <b>A line that matches no rule is silently ignored.</b> That is a feature: banners, blank lines and prompts do no harm. It is also a danger, which chapter 9 deals with.</p>

<h3>What the engine does with each line</h3>
<table class="cmp"><tr><th>Input line</th><th>Does the rule match?</th><th>Result</th></tr>
<tr><td>Interface IP-Address OK? Method Status Protocol</td><td>No: "OK?" is not a word followed by two more words and a status</td><td>Ignored</td></tr>
<tr><td>GigabitEthernet0/0 10.99.0.1 YES manual up up</td><td>Yes</td><td>Four Values saved, then Record</td></tr>
<tr><td>(empty line at the end)</td><td>No</td><td>Ignored</td></tr></table>
<p>The engine tries the rules of the current state <b>from top to bottom</b>. The first rule that matches wins, and the engine moves on to the next line. This is why the order of rules matters once you have more than one.</p>

<h3>Writing the file in the lab</h3>
<p>You create template files from the shell. Put quotes around the end marker: <code>cat &gt; ipbrief.textfsm &lt;&lt;'EOF'</code>. With the quotes the shell leaves the text exactly as typed. Without them the shell would treat the dollar-brace parts as shell variables and swallow them. Finish with a line that holds only <code>EOF</code>.</p>

<div class="eg"><p><b>Worked example.</b> To also capture the OK? column, add <code>Value OK (YES|NO)</code> and put <code>&#36;{OK}</code> in the rule where <code>\\w+</code> stood. The header grows to five names and every row gets a fifth item.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the blank line after the Values. Writing a rule without the leading <code>^</code> or without indentation. Forgetting parentheses in a Value line (<code>Value A \\S+</code> is an error). Spelling a Value name differently in the rule than in the Value line.</p></div>
<div class="exam"><p><b>Exam trap.</b> Value names are normally written in capitals, and the state <code>Start</code> is spelled exactly like that. The header lists names in the order of the Value lines, not in the order they appear in the rule.</p></div>

<div class="scn"><h4>The template that returned nothing</h4><p>A junior engineer saved a template from an email. It loaded without error but returned an empty list. The rule lines had no leading spaces after the copy, so the file was read as a list of state names. Re-indenting two lines fixed it.</p><p><b>Lesson:</b> rule lines are indented, state names are not. Check the layout first when nothing parses.</p></div>

<div class="iv"><p class="q">"Explain the structure of a TextFSM template."</p><p>Value lines at the top declare fields with a name, optional options and a regex in parentheses. A blank line follows. Then come states, starting with the mandatory Start; each state holds rules that begin with ^, may refer to a Value as dollar-brace NAME, and may end with an action such as Record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template = Value lines, a blank line, then states with rules.</li>
<li>A Value is a name plus a regex in parentheses; the state <code>Start</code> is mandatory.</li>
<li>Rules start with <code>^</code> and are indented; the first matching rule wins.</li>
<li><code>-&gt; Record</code> saves a row; a line that matches nothing is ignored.</li>
<li>The header lists the Value names in declaration order.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> TextFSM template ek chhoti text file hai jisme sirf do hisse hote hain. Pehla hissa batata hai <i>kya</i> capture karna hai. Doosra hissa batata hai <i>kab</i>. Is chapter ke baad aap koi bhi template padh sakte ho, aur Lab 1 ka pehla template likh sakte ho.</p>

<h3>Analogy: boxes wala form</h3>
<p>Ek printed form socho. Boxes (naam, tareekh, amount) <b>Values</b> hain. Clerk ke liye instructions ("jab invoice row jaisi line dikhe to teen boxes copy karo aur row file karo") <b>rules</b> hain. Rules <b>states</b> ke andar rehte hain, jo form ke sections jaise hain: "header section", "table section".</p>

<h3>Lab 1 ka template, line by line</h3>
<p>Yeh woh file <code>ipbrief.textfsm</code> hai jo aap Lab 1 mein likhoge. Yeh <code>show ip interface brief</code> ko parse karti hai.</p>
<pre class="code">Value Required INTF (\\S+)
Value IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)
Value STATUS (up|down|administratively down)
Value PROTO (up|down)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<ul>
<li><b>Value line</b>: shabd <code>Value</code>, optional options, field ka <b>naam</b>, aur field ko match karne wali <b>parentheses mein regular expression</b>. <code>INTF</code> non-space characters ka koi bhi run hai. <code>IP</code> dot se alag chaar numbers hai, ya shabd <code>unassigned</code>.</li>
<li><b>Blank line</b>: yeh Values ki list khatam karti hai. Yeh zaroori hai.</li>
<li><b>State ka naam</b> (<code>Start</code>): line ke bilkul shuru mein ek shabd, pehle koi space nahi. Har template mein <code>Start</code> naam ka state hona zaroori hai.</li>
<li><b>Rule line</b>: kam se kam ek space se indented, aur <code>^</code> se shuru honi chahiye, jiska matlab hai "line ke shuru se".</li>
<li>Rule ke andar <code>&#36;{INTF}</code> Value ki apni regular expression se badal jaata hai, aur jo kuch woh match karta hai woh us field mein save hota hai.</li>
<li><code>\\s+</code> ka matlab "ek ya zyada spaces". <code>\\w+</code> ka matlab "ek ya zyada letters ya digits", yahan OK? aur Method columns skip karne ke liye, jinki zaroorat nahi.</li>
<li><code>-&gt; Record</code> arrow ke baad ka <b>action</b> hai: maujooda Values ko ek row ki tarah save karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="show ip interface brief ki ek line Values INTF, IP, skipped columns, STATUS aur PROTO mein tooti hui">
<text x="10" y="22" class="svg-muted" font-size="12">Text ki ek line:</text>
<rect x="10" y="32" width="150" height="34" rx="6" fill="#bae6fd"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">GigabitEthernet0/1</text>
<rect x="165" y="32" width="90" height="34" rx="6" fill="#bbf7d0"/><text x="210" y="54" text-anchor="middle" class="svg-ink" font-size="12">unassigned</text>
<rect x="260" y="32" width="40" height="34" rx="6" fill="#e2e8f0"/><text x="280" y="54" text-anchor="middle" class="svg-ink" font-size="12">YES</text>
<rect x="305" y="32" width="55" height="34" rx="6" fill="#e2e8f0"/><text x="332" y="54" text-anchor="middle" class="svg-ink" font-size="12">unset</text>
<rect x="365" y="32" width="170" height="34" rx="6" fill="#fde68a"/><text x="450" y="54" text-anchor="middle" class="svg-ink" font-size="12">administratively down</text>
<rect x="540" y="32" width="90" height="34" rx="6" fill="#ddd6fe"/><text x="585" y="54" text-anchor="middle" class="svg-ink" font-size="12">down</text>
<text x="85" y="92" text-anchor="middle" class="svg-accent" font-size="12">INTF</text><text x="210" y="92" text-anchor="middle" class="svg-accent" font-size="12">IP</text><text x="332" y="92" text-anchor="middle" class="svg-muted" font-size="12">skip (\\w+)</text><text x="450" y="92" text-anchor="middle" class="svg-accent" font-size="12">STATUS</text><text x="585" y="92" text-anchor="middle" class="svg-accent" font-size="12">PROTO</text>
<line x1="85" y1="68" x2="85" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="210" y1="68" x2="210" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="332" y1="68" x2="332" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="450" y1="68" x2="450" y2="80" stroke="#64748b" stroke-width="1.5"/><line x1="585" y1="68" x2="585" y2="80" stroke="#64748b" stroke-width="1.5"/>
<rect x="10" y="112" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">row = ['GigabitEthernet0/1', 'unassigned', 'administratively down', 'down']</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="11">-&gt; Record ke baad Values result mein ek row ban jaate hain</text>
</svg><p class="cap">Rule poori line match karta hai; Values woh hisse hain jo hum rakhte hain.</p></div>

<h3>Chalao</h3>
<p>Lab aapko <code>parse_one.py</code> deti hai, jo koi bhi template kisi bhi text file par chalati hai. Yeh kaise kaam karti hai woh chapter 5 mein padhoge; abhi bas chalao.</p>
<pre class="out">AUTO01$ python3 parse_one.py ipbrief.textfsm r1_ipbrief.txt
<span class="hl">['INTF', 'IP', 'STATUS', 'PROTO']</span>
['GigabitEthernet0/0', '10.99.0.1', 'up', 'up']
['GigabitEthernet0/1', 'unassigned', 'administratively down', 'down']
['GigabitEthernet0/2', 'unassigned', 'administratively down', 'down']
['GigabitEthernet0/3', 'unassigned', 'administratively down', 'down']
['Loopback0', '1.1.1.1', 'up', 'up']</pre>
<p>Pehli line <b>header</b> hai: Values jis order mein declare hue us order mein field names. Uske neeche har interface ki ek row hai. Router output ki header line ("Interface IP-Address OK? ...") se koi row nahi bani, kyunki koi rule match nahi hua. <b>Jo line kisi rule se match nahi hoti woh chupchaap ignore ho jaati hai.</b> Yeh feature hai: banners, blank lines aur prompts se nuksaan nahi hota. Yeh khatra bhi hai, jisse chapter 9 nipatta hai.</p>

<h3>Engine har line ke saath kya karta hai</h3>
<table class="cmp"><tr><th>Input line</th><th>Kya rule match hua?</th><th>Result</th></tr>
<tr><td>Interface IP-Address OK? Method Status Protocol</td><td>Nahi: "OK?" ke baad do shabd aur status wala pattern nahi banta</td><td>Ignore</td></tr>
<tr><td>GigabitEthernet0/0 10.99.0.1 YES manual up up</td><td>Haan</td><td>Chaar Values save, phir Record</td></tr>
<tr><td>(ant ki khaali line)</td><td>Nahi</td><td>Ignore</td></tr></table>
<p>Engine maujooda state ke rules <b>upar se neeche</b> try karta hai. Jo pehla rule match karta hai woh jeet jaata hai, aur engine agli line par chala jaata hai. Isliye ek se zyada rule hone par rules ka order matter karta hai.</p>

<h3>Lab mein file likhna</h3>
<p>Template files aap shell se banate ho. End marker ke aas-paas quotes lagao: <code>cat &gt; ipbrief.textfsm &lt;&lt;'EOF'</code>. Quotes ke saath shell text ko bilkul waisa hi rehne deta hai jaisa type kiya. Quotes ke bina shell dollar-brace wale hisson ko shell variables samajhkar nigal jaata. Ant mein ek aisi line likho jisme sirf <code>EOF</code> ho.</p>

<div class="eg"><p><b>Worked example.</b> OK? column bhi capture karne ke liye <code>Value OK (YES|NO)</code> jodo aur rule mein jahan <code>\\w+</code> tha wahan <code>&#36;{OK}</code> rakho. Header mein paanch naam ho jaate hain aur har row mein paanchva item aa jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Values ke baad blank line bhool jaana. Rule bina shuruaati <code>^</code> ya bina indentation ke likhna. Value line mein parentheses bhool jaana (<code>Value A \\S+</code> error hai). Value ka naam rule mein Value line se alag spell karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Value names aam taur par capitals mein likhte hain, aur state <code>Start</code> bilkul isi spelling mein hota hai. Header names ko Value lines ke order mein dikhata hai, rule mein jis order mein woh aate hain us order mein nahi.</p></div>

<div class="scn"><h4>Jo template kuch nahi laaya</h4><p>Ek junior engineer ne email se ek template save kiya. Woh bina error ke load hua par khaali list laaya. Copy ke baad rule lines ke shuru ke spaces gayab the, isliye file ko state names ki list padha gaya. Do lines dobara indent karne se theek ho gaya.</p><p><b>Lesson:</b> rule lines indented hoti hain, state names nahi. Kuch parse na ho to pehle layout check karo.</p></div>

<div class="iv"><p class="q">"TextFSM template ka structure samjhao."</p><p>Upar Value lines naam, optional options aur parentheses mein regex ke saath fields declare karti hain. Phir blank line aati hai. Uske baad states, jisme zaroori Start se shuru; har state mein rules hote hain jo ^ se shuru hote hain, Value ko dollar-brace NAME ki tarah le sakte hain, aur Record jaise action par khatam ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = Value lines, blank line, phir rules wale states.</li>
<li>Value = naam plus parentheses mein regex; state <code>Start</code> zaroori hai.</li>
<li>Rules <code>^</code> se shuru hote hain aur indented hote hain; pehla matching rule jeetta hai.</li>
<li><code>-&gt; Record</code> row save karta hai; jo line kisi se match na ho woh ignore hoti hai.</li>
<li>Header Value names ko declaration order mein dikhata hai.</li>
</ul></div>
`}};export{e as default};