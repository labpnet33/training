var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(t,n,r,i,a,o,s)=>`<rect x="`+t+`" y="`+n+`" width="`+r+`" height="`+i+`" rx="9" fill="`+a+`"/>`+e(t+r/2,n+22,o)+(s?e(t+r/2,n+40,s,`svg-muted`):``),n=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,r=(e,r)=>`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flow of main() in safepush.py with its early exits">`+t(6,20,112,50,`#bae6fd`,e[0],e[1])+t(138,20,112,50,`#ddd6fe`,e[2],e[3])+t(270,20,112,50,`#fde68a`,e[4],e[5])+t(402,20,112,50,`#fed7aa`,e[6],e[7])+t(534,20,100,50,`#bbf7d0`,e[8],e[9])+n(118,45,138,45)+n(250,45,270,45)+n(382,45,402,45)+n(514,45,534,45)+n(326,70,326,120)+n(458,70,458,120)+n(584,70,584,120)+t(270,120,112,46,`#e2e8f0`,e[10],e[11])+t(402,120,112,46,`#e2e8f0`,e[12],e[13])+t(534,120,100,46,`#fecaca`,e[14],e[15])+t(6,182,628,36,`#e2e8f0`,e[16],``)+`</svg><p class="cap">`+r+`</p></div>`,i=`<pre class="out"><span class="hl">AUTO01$ ls</span>
baseline-r2.cfg  baseline.cfg  devices.csv  safepush.py  samples
<span class="hl">AUTO01$ cat devices.csv</span>
name,ip
R1,10.99.0.1
R2,10.99.0.2
<span class="hl">AUTO01$ cat baseline.cfg</span>
service password-encryption
no ip domain lookup
ntp server 10.99.0.50
logging host 10.99.0.51
snmp-server community NKRO RO
ip ssh time-out 60
<span class="hl">AUTO01$ grep -n "def \\|^main" safepush.py</span>
14:def clean(text):
20:def inverse(line):
24:def rejected_lines(output):
35:def save(path, lines):
41:def lookup(name):
49:def audit(host, status, added):
55:def main():
99:main()</pre>`,a=`<pre class="code">    wanted = [ln.strip() for ln in open(args.baseline) if ln.strip()]
    conn = ConnectHandler(device_type="nk_ios", host=lookup(args.host), username="netops", password="NK@2026")
    before = clean(conn.send_command("show running-config"))
    save(f"backups/{args.host}-before.cfg", before)        <span class="c"># 1 backup</span>

    todo = [ln for ln in wanted if ln not in before]       <span class="c"># 2 plan</span>
    print(f"{args.host}: {len(todo)} of {len(wanted)} baseline lines to add")
    for ln in todo:
        print("  +", ln)
    if not todo:
        print("nothing to do")
        return
    if not args.apply:                                     <span class="c"># 3 preview</span>
        print("dry run - nothing was changed (add --apply to push)")
        return</pre>`,o=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py --help</span>
usage: safepush.py [-h] [--baseline BASELINE] [--apply] host

Safely push a baseline to one router.

positional arguments:
  host                  router name from devices.csv, for example R1

options:
  -h, --help            show this help message and exit
  --baseline BASELINE   
  <span class="hl">--apply               really push (the default is a dry run)</span></pre>`,s=(e,t)=>`<table class="cmp"><tr>`+e.map(e=>`<th>`+e+`</th>`).join(``)+`</tr>`+t.map(e=>`<tr>`+e.map(e=>`<td>`+e+`</td>`).join(``)+`</tr>`).join(``)+`</table>`,c={id:`six-step-pattern`,h:{en:`The six-step pattern and the lab tool`,hi:`Six-step pattern aur lab ka tool`},body:{en:`
<p><b>The idea of this chapter:</b> every safe change tool does the same things in the same order. If you learn the order once, you can read any push script, yours or a colleague's, and see at once which step is missing.</p>

<h3>Analogy: the pre-flight check</h3>
<p>A pilot never starts the engines first and reads the checklist later. Fuel, flaps, instruments, then take-off, and a plan for what to do if an engine fails. A push tool is a pre-flight check written in Python.</p>

<h3>The six steps and the audit</h3>
`+s([`Step`,`Question it answers`,`Line in safepush.py`,`What it leaves behind`],[[`1 Backup`,`What was on the router before?`,`<code>before = clean(...)</code> and <code>save(...)</code>`,`<code>backups/R1-before.cfg</code>`],[`2 Plan`,`Which baseline lines are missing?`,`<code>todo = [ln for ln in wanted if ln not in before]</code>`,`the printed list of <code>+</code> lines`],[`3 Preview`,`What would happen?`,`<code>if not args.apply: ... return</code>`,`nothing changes`],[`4 Push`,`Send the missing lines`,`<code>conn.send_config_set(todo)</code>`,`a changed router`],[`5 Verify`,`Did every line land?`,`<code>after = clean(...)</code>, <code>missing = [...]</code>`,`<code>changes/R1.diff</code>`],[`6 Undo`,`Put the router back`,`<code>send_config_set([inverse(ln) ...])</code>`,`a restored router`],[`Audit`,`What happened, and when?`,`<code>audit(args.host, status, len(todo))</code>`,`<code>changes.log</code>`]])+`
<p>The next seven chapters take these steps one at a time. This chapter shows the whole tool so that each later chapter has a place to hang on.</p>

<h3>The files in Lab 1</h3>
<p>Log in to <b>AUTO01</b> as <code>netadmin</code>. Your senior left the tool and its inputs in your home folder:</p>
`+i+`
<p><code>devices.csv</code> maps a router name to its address, so you type <code>R1</code> and the tool finds 10.99.0.1. <code>baseline.cfg</code> is the target: six lines every router should have. <code>baseline-r2.cfg</code> is a second file for R2 (it contains a typo; Chapter 6 uses it). <code>samples</code> holds two old configs for the diff exercise. The <code>grep -n</code> output is a map of the program: five small helper functions and <code>main()</code>, which is the six steps in order.</p>

<h3>The first half of main()</h3>
`+a+`
<p>Read it from the top. The tool reads the wanted lines, connects, saves a cleaned copy of the running configuration, and builds <code>todo</code>. Then come <b>two early exits</b>. If <code>todo</code> is empty it prints <code>nothing to do</code> and stops, so the tool is safe to run twice. If you did not type <code>--apply</code> it prints the plan and stops, so the default run is a preview. Everything after that point can change a router, and the code reaches it only on purpose.</p>

<h3>The options</h3>
<p>The tool has one required word (the router name), one option with a default (<code>--baseline</code>) and one on/off switch (<code>--apply</code>). Chapter 5 explains the switch.</p>
`+o+`

`+r([`Backup`,`save before.cfg`,`Plan`,`missing lines`,`todo empty?`,`no: continue`,`--apply?`,`yes: push`,`Verify`,`lines present?`,`nothing`,`to do`,`dry run`,`no change`,`Roll back`,`inverse lines`,`Every exit that touched a router ends with one audit line in changes.log`],`main() as a flow: two quiet exits before the push, one rescue after it.`)+`

<div class="eg"><p><b>Worked example.</b> You run <code>python3 safepush.py R1</code> three times with the same baseline. The first and second show a plan (a dry run changes nothing). After one run with <code>--apply</code> the plan becomes empty and the tool prints <code>nothing to do</code>. The tool describes the <b>difference</b> between wanted and actual, not a list of commands to repeat, so it is idempotent.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the backup after the push (it then saves the new state). Making the real push the default and the preview an option. Running the script on all routers before it has been proved on one.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is fixed: back up, plan, preview, push, verify, undo. A tool that verifies by reading the config before the push, or backs up after it, has the right words and the wrong order.</p></div>

<div class="scn"><h4>The script that was safe only on the first run</h4><p>A colleague wrote a loop that pushed all baseline lines every time. Running it again re-sent every line, and one command (an access-list line) was added a second time at the bottom of an ACL. The plan step, which sends only the missing lines, would have made the second run a no-op.</p><p><b>Lesson:</b> compute the difference first. Repeating a safe run should change nothing.</p></div>

<div class="iv"><p class="q">"What does idempotent mean for a push script?"</p><p>Running it again with the same input leaves the same result. The script compares wanted with actual, sends only what is missing, and prints <code>nothing to do</code> when the router already matches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: backup, plan, preview, push, verify, undo, with an audit entry at the end.</li>
<li><code>main()</code> in <code>safepush.py</code> has two quiet early exits: nothing to do, and dry run.</li>
<li>Files: <code>backups/</code> (before copy), <code>changes/</code> (diff), <code>changes.log</code> (audit).</li>
<li>Only missing lines are sent, so a second run is harmless.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har safe change tool wahi cheezein usi order mein karta hai. Order ek baar seekh lo to aap koi bhi push script, apni ya colleague ki, padhkar turant dekh sakte ho ki kaunsa step missing hai.</p>

<h3>Analogy: pre-flight check</h3>
<p>Pilot kabhi engine pehle start karke checklist baad mein nahi padhta. Fuel, flaps, instruments, phir take-off, aur engine fail ho to kya karna hai uska plan. Push tool Python mein likhi hui pre-flight check hai.</p>

<h3>Chhe steps aur audit</h3>
`+s([`Step`,`Kaunsa sawaal`,`safepush.py mein line`,`Peeche kya chhodta hai`],[[`1 Backup`,`Router par pehle kya tha?`,`<code>before = clean(...)</code> aur <code>save(...)</code>`,`<code>backups/R1-before.cfg</code>`],[`2 Plan`,`Baseline ki kaun si lines missing hain?`,`<code>todo = [ln for ln in wanted if ln not in before]</code>`,`print hui <code>+</code> lines ki list`],[`3 Preview`,`Kya hoga?`,`<code>if not args.apply: ... return</code>`,`kuch nahi badalta`],[`4 Push`,`Missing lines bhejo`,`<code>conn.send_config_set(todo)</code>`,`badla hua router`],[`5 Verify`,`Kya har line pahunchi?`,`<code>after = clean(...)</code>, <code>missing = [...]</code>`,`<code>changes/R1.diff</code>`],[`6 Undo`,`Router ko wapas rakho`,`<code>send_config_set([inverse(ln) ...])</code>`,`restore hua router`],[`Audit`,`Kya hua, aur kab?`,`<code>audit(args.host, status, len(todo))</code>`,`<code>changes.log</code>`]])+`
<p>Agle saat chapters in steps ko ek-ek karke lete hain. Yeh chapter poora tool dikhata hai taaki har agle chapter ko latakne ki jagah mile.</p>

<h3>Lab 1 ki files</h3>
<p><b>AUTO01</b> par <code>netadmin</code> se login karo. Aapke senior ne tool aur uske inputs aapke home folder mein chhode hain:</p>
`+i+`
<p><code>devices.csv</code> router ke naam ko address se jodta hai, isliye aap <code>R1</code> type karte ho aur tool 10.99.0.1 dhoondh leta hai. <code>baseline.cfg</code> target hai: chhe lines jo har router par honi chahiye. <code>baseline-r2.cfg</code> R2 ke liye doosri file hai (usmein typo hai; Chapter 6 use karta hai). <code>samples</code> mein diff exercise ke liye do purani configs hain. <code>grep -n</code> ka output program ka naksha hai: paanch chhote helper functions aur <code>main()</code>, jo order mein chhe steps hai.</p>

<h3>main() ka pehla aadha hissa</h3>
`+a+`
<p>Upar se padho. Tool wanted lines padhta hai, connect karta hai, running configuration ki saaf copy save karta hai, aur <code>todo</code> banata hai. Phir <b>do early exits</b> aate hain. <code>todo</code> khaali ho to <code>nothing to do</code> print karke ruk jaata hai, isliye tool do baar chalana safe hai. Aapne <code>--apply</code> type nahi kiya to plan print karke ruk jaata hai, isliye default run preview hai. Is point ke baad ka sab kuch router badal sakta hai, aur code wahan sirf jaanbujhkar pahunchta hai.</p>

<h3>Options</h3>
<p>Tool mein ek zaroori shabd hai (router ka naam), default wala ek option (<code>--baseline</code>) aur ek on/off switch (<code>--apply</code>). Chapter 5 switch samjhata hai.</p>
`+o+`

`+r([`Backup`,`before.cfg save`,`Plan`,`missing lines`,`todo khaali?`,`nahi: aage`,`--apply?`,`haan: push`,`Verify`,`lines hain?`,`kuch`,`nahi karna`,`dry run`,`no change`,`Roll back`,`inverse lines`,`Router ko chhune wala har exit changes.log mein ek audit line ke saath khatam hota hai`],`main() ek flow ki tarah: push se pehle do shaant exits, push ke baad ek rescue.`)+`

<div class="eg"><p><b>Worked example.</b> Aap wahi baseline ke saath <code>python3 safepush.py R1</code> teen baar chalate ho. Pehla aur doosra plan dikhate hain (dry run kuch nahi badalta). <code>--apply</code> ke ek run ke baad plan khaali ho jaata hai aur tool <code>nothing to do</code> print karta hai. Tool wanted aur actual ka <b>antar</b> batata hai, dohraye jaane wale commands ki list nahi, isliye yeh idempotent hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Backup ko push ke baad rakhna (tab woh naya state save karta hai). Asli push ko default aur preview ko option banana. Script ko ek router par saabit kiye bina saare routers par chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order fixed hai: backup, plan, preview, push, verify, undo. Jo tool push se pehle config padhkar verify kare ya push ke baad backup le, uske paas sahi shabd hain aur galat order.</p></div>

<div class="scn"><h4>Script jo sirf pehle run par safe thi</h4><p>Ek colleague ne loop likha jo har baar baseline ki saari lines push karta tha. Dobara chalane par har line phir se bheji gayi, aur ek command (access-list line) ACL ke neeche doosri baar jud gayi. Plan step, jo sirf missing lines bhejta hai, doosre run ko no-op bana deta.</p><p><b>Lesson:</b> pehle antar nikalo. Safe run dohrane se kuch nahi badalna chahiye.</p></div>

<div class="iv"><p class="q">"Push script ke liye idempotent ka kya matlab hai?"</p><p>Wahi input ke saath dobara chalane par wahi result rehta hai. Script wanted ko actual se compare karti hai, sirf missing bhejti hai, aur router pehle se match kare to <code>nothing to do</code> print karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: backup, plan, preview, push, verify, undo, aur end mein audit entry.</li>
<li><code>safepush.py</code> ke <code>main()</code> mein do shaant early exits hain: nothing to do, aur dry run.</li>
<li>Files: <code>backups/</code> (before copy), <code>changes/</code> (diff), <code>changes.log</code> (audit).</li>
<li>Sirf missing lines bheji jaati hain, isliye doosra run harmless hai.</li>
</ul></div>
`}};export{c as default};