var e=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n,r,i,a,o,s)=>`<rect x="`+t+`" y="`+n+`" width="`+r+`" height="`+i+`" rx="9" fill="`+a+`"/>`+e(t+r/2,n+22,o)+(s?e(t+r/2,n+40,s,`svg-muted`,11):``),n=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,r=(e,r)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="With and without --apply">`+t(10,10,190,50,`#bae6fd`,e[0],e[1])+t(10,120,190,50,`#bae6fd`,e[2],e[3])+n(200,35,250,35)+n(200,145,250,145)+t(250,10,170,50,`#ddd6fe`,e[4],e[5])+t(250,120,170,50,`#ddd6fe`,e[4],e[5])+n(420,35,470,35)+n(420,145,470,145)+t(470,10,160,50,`#e2e8f0`,e[6],e[7])+t(470,120,160,50,`#fed7aa`,e[8],e[9])+`</svg><p class="cap">`+r+`</p></div>`,i=`<pre class="code">ap = argparse.ArgumentParser(description="Safely push a baseline to one router.")
ap.add_argument("host", help="router name from devices.csv, for example R1")
ap.add_argument("--baseline", default="baseline.cfg")
ap.add_argument("--apply", action="store_true", help="really push (the default is a dry run)")
args = ap.parse_args()</pre>`,a=`<pre class="code">import argparse

ap = argparse.ArgumentParser()
ap.add_argument("host")
ap.add_argument("--baseline", default="baseline.cfg")
ap.add_argument("--apply", action="store_true")
for argv in (["R1"], ["R1", "--apply"], ["R2", "--baseline", "baseline-r2.cfg", "--apply"]):
    a = ap.parse_args(argv)
    print(argv, "-&gt;", a.host, a.baseline, a.apply)</pre>`,o=`<pre class="out"><span class="hl">AUTO01$ python3 argdemo.py</span>
['R1'] -&gt; R1 baseline.cfg <span class="hl">False</span>
['R1', '--apply'] -&gt; R1 baseline.cfg <span class="hl">True</span>
['R2', '--baseline', 'baseline-r2.cfg', '--apply'] -&gt; R2 baseline-r2.cfg True</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R1</span>
<span class="hl">R1: 5 of 6 baseline lines to add</span>
  + service password-encryption
  + no ip domain lookup
  + logging host 10.99.0.51
  + snmp-server community NKRO RO
  + ip ssh time-out 60
<span class="hl">dry run - nothing was changed (add --apply to push)</span>
<span class="hl">AUTO01$ grep -n "service" backups/R1-before.cfg</span>
2:service timestamps debug datetime msec
3:service timestamps log datetime msec
4:no service password-encryption</pre>`,c=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R2 --baseline baseline-r2.cfg</span>
R2: 4 of 4 baseline lines to add
  + no ip domain lookup
  + ntp server 10.99.0.50
  + <span class="hl">snmp-server communty NKRO RO</span>
  + logging host 10.99.0.51
dry run - nothing was changed (add --apply to push)</pre>`,l=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R9; echo "rc=$?"</span>
R9 is not in devices.csv
rc=1
<span class="hl">AUTO01$ python3 safepush.py R1 --baseline nothere.cfg; echo "rc=$?"</span>
Traceback (most recent call last):
  File "safepush.py", line 99, in &lt;module&gt;
    main()
  File "safepush.py", line 62, in main
    wanted = [ln.strip() for ln in open(args.baseline) if ln.strip()]
FileNotFoundError: [Errno 2] No such file or directory: 'nothere.cfg'
rc=1</pre>`,u={id:`dry-run-plan`,h:{en:`The dry run: a plan that only lists missing lines`,hi:`Dry run: plan jo sirf missing lines dikhata hai`},body:{en:`
<p><b>The idea of this chapter:</b> the safest command in the tool is the one you get when you type nothing special. Without <code>--apply</code> the tool shows exactly what it would send and stops. A real change needs a deliberate extra word.</p>

<h3>Analogy: the fitting room</h3>
<p>A shop lets you try the jacket before you pay. You see how it fits, and nothing is sold. A <b>dry run</b> is the fitting room: the script does all the thinking (connect, read, compare, list) and none of the doing. Because trying is free, people try; and people who try catch mistakes while they are still cheap.</p>

<h3>The switch: argparse in five lines</h3>
<p>The module <b>py-tools</b> explains <code>argparse</code> in depth. For now you need only these lines from <code>safepush.py</code>:</p>
`+i+`
<ul>
<li><code>"host"</code> has no dashes, so it is a required <b>positional</b> word: <code>python3 safepush.py R1</code>.</li>
<li><code>"--baseline"</code> is an option with a value. The <code>default</code> is used when you do not type it.</li>
<li><code>action="store_true"</code> makes <code>--apply</code> an on/off switch. Absent, <code>args.apply</code> is <code>False</code>; present, it is <code>True</code>.</li>
</ul>
<p>To see the three combinations without touching a router, write <code>argdemo.py</code>:</p>
`+a+`
`+o+`
<p>The important design choice is the <b>direction</b> of the default. The switch is called <code>--apply</code>, not <code>--dry-run</code>. If someone runs the tool in a hurry, forgets every option and presses Enter, the harmless thing happens. A tool whose default is to change routers is waiting for the day somebody pastes the wrong line into the terminal.</p>

`+r([`safepush.py R1`,`no switch`,`safepush.py R1 --apply`,`with the switch`,`backup + plan`,`same for both`,`Preview, stop`,`router untouched`,`Push, verify`,`router changed`],`The same command line, with and without --apply. The first half of the work is identical.`)+`

<h3>The plan: only what is missing</h3>
<p>The plan is one line of Python from Chapter 2:</p>
<pre class="code">wanted = [ln.strip() for ln in open(args.baseline) if ln.strip()]   <span class="c"># non-empty lines of the file</span>
todo = [ln for ln in wanted if ln not in before]                      <span class="c"># not already on the router</span></pre>
<p><code>wanted</code> is the baseline file turned into a list, one item per non-blank line. <code>todo</code> keeps each wanted line that is <b>not</b> in the cleaned running configuration (Chapter 3: whole lines). The tool never lists a line the router already has, which is what makes a second run harmless.</p>

<h3>Lab 1, task 2: the dry run on R1</h3>
<p>Run the tool with no switches. It connects, saves the backup, prints the plan and stops:</p>
`+s+`
<p>R1 already has <code>ntp server 10.99.0.50</code>, so only <b>5 of the 6</b> baseline lines are missing. The dry run still wrote <code>backups/R1-before.cfg</code> on AUTO01, which is only a file on the Linux host; the router was not changed. The grep shows the router's own wording: while the feature is off it prints <code>no service password-encryption</code>. Remember that line; Chapter 7 shows what happens to it.</p>

<h3>What a dry run cannot tell you</h3>
<p>A preview proves what the tool <b>would send</b>. It cannot prove the router will <b>accept</b> it. The second file, <code>baseline-r2.cfg</code>, contains a typo:</p>
`+c+`
<p>The plan happily lists <code>communty</code>. Only the router can say it is invalid, and it says so at push time. That is why the pattern has steps 5 and 6, and why a dry run is a step in the pattern, not the whole pattern.</p>

<h3>Errors before the push</h3>
<p>Two mistakes are caught before any router is touched, and both stop the tool with exit code 1:</p>
`+l+`
<p>An unknown name is handled politely, because <code>lookup()</code> raises <code>SystemExit</code> with a sentence. A missing baseline file gives a traceback, which is honest but noisy; <b>py-tools</b> shows how to turn it into a friendly message.</p>

<div class="warn"><p><b>Common mistakes.</b> Making the dangerous action the default. Calling the preview a "test" and trusting it as proof of acceptance. Printing a plan that lists lines the router already has, which makes a harmless re-run look like a change.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>store_true</code> options are <code>False</code> unless typed. <code>--apply</code> in the command line becomes <code>args.apply</code> in the code.</p></div>

<div class="scn"><h4>The pasted command</h4><p>An engineer copied a command from an old ticket into the terminal at the end of a long day. It was the script name followed by a router name and nothing else. Because the tool is dry-run by default, the output was a plan, and the engineer saw 14 lines to add on a router that should have needed none. The wrong baseline file was still the default, and the dry run exposed it before anything changed.</p><p><b>Lesson:</b> a safe default turns a mistake into a message.</p></div>

<div class="iv"><p class="q">"What is a dry run and how do you implement one?"</p><p>It is a run that does all the reading and comparing and stops before any change. I make it the default and add an explicit <code>--apply</code> switch with <code>action="store_true"</code>, so changing a device always takes a deliberate extra word. I also point out its limit: it shows what would be sent, not whether the device will accept it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dry run is the default; <code>--apply</code> is the opt-in switch (<code>store_true</code>).</li>
<li>The plan is <code>[ln for ln in wanted if ln not in before]</code>: only missing, whole lines.</li>
<li>A dry run writes the local backup but never touches the router.</li>
<li>A preview cannot catch a line the router will reject; the push and verify steps do that.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> tool ka sabse safe command woh hai jo aap kuch khaas type kiye bina chalate ho. <code>--apply</code> ke bina tool bilkul dikhata hai ki woh kya bhejta, aur ruk jaata hai. Asli change ke liye jaanbujhkar ek extra shabd chahiye.</p>

<h3>Analogy: trial room</h3>
<p>Dukaan paise dene se pehle jacket pehen kar dekhne deti hai. Fit dekh lete ho, kuch bikta nahi. <b>Dry run</b> trial room hai: script saari sochne wali baat karti hai (connect, read, compare, list) aur karne wali koi nahi. Try karna free hai, isliye log try karte hain; aur try karne wale galtiyan tab pakadte hain jab woh sasti hoti hain.</p>

<h3>Switch: paanch lines mein argparse</h3>
<p>Module <b>py-tools</b> <code>argparse</code> gehrai se samjhata hai. Abhi aapko <code>safepush.py</code> ki sirf yeh lines chahiye:</p>
`+i+`
<ul>
<li><code>"host"</code> mein dash nahi hai, isliye woh zaroori <b>positional</b> shabd hai: <code>python3 safepush.py R1</code>.</li>
<li><code>"--baseline"</code> value wala option hai. Aap type na karo to <code>default</code> use hota hai.</li>
<li><code>action="store_true"</code> <code>--apply</code> ko on/off switch banata hai. Na likho to <code>args.apply</code> <code>False</code> hai; likho to <code>True</code>.</li>
</ul>
<p>Router chhue bina teen combinations dekhne ke liye <code>argdemo.py</code> likho:</p>
`+a+`
`+o+`
<p>Sabse zaroori design choice default ki <b>disha</b> hai. Switch ka naam <code>--apply</code> hai, <code>--dry-run</code> nahi. Koi jaldi mein tool chalaye, saare options bhool jaaye aur Enter dabaye, to harmless cheez hoti hai. Jis tool ka default routers badalna hai, woh us din ka intezaar kar raha hai jab koi galat line terminal mein paste kar de.</p>

`+r([`safepush.py R1`,`switch nahi`,`safepush.py R1 --apply`,`switch ke saath`,`backup + plan`,`dono ke liye same`,`Preview, ruko`,`router untouched`,`Push, verify`,`router badla`],`Wahi command line, --apply ke saath aur uske bina. Kaam ka pehla aadha hissa same hai.`)+`

<h3>Plan: sirf jo missing hai</h3>
<p>Plan Chapter 2 ki Python ki ek line hai:</p>
<pre class="code">wanted = [ln.strip() for ln in open(args.baseline) if ln.strip()]   <span class="c"># file ki non-empty lines</span>
todo = [ln for ln in wanted if ln not in before]                      <span class="c"># router par pehle se nahi</span></pre>
<p><code>wanted</code> baseline file ko list banata hai, har non-blank line ek item. <code>todo</code> har wanted line rakhta hai jo cleaned running configuration mein <b>nahi</b> hai (Chapter 3: poori lines). Tool kabhi woh line list nahi karta jo router ke paas pehle se hai, isi se doosra run harmless hota hai.</p>

<h3>Lab 1, task 2: R1 par dry run</h3>
<p>Tool ko bina switch ke chalao. Woh connect karta hai, backup save karta hai, plan print karta hai aur ruk jaata hai:</p>
`+s+`
<p>R1 ke paas <code>ntp server 10.99.0.50</code> pehle se hai, isliye baseline ki chhe mein se sirf <b>5</b> lines missing hain. Dry run ne phir bhi AUTO01 par <code>backups/R1-before.cfg</code> likhi, jo Linux host par sirf ek file hai; router badla nahi. Grep router ke apne shabd dikhata hai: feature off ho tab woh <code>no service password-encryption</code> print karta hai. Yeh line yaad rakho; Chapter 7 dikhata hai ki iske saath kya hota hai.</p>

<h3>Dry run kya nahi bata sakta</h3>
<p>Preview saabit karta hai ki tool kya <b>bhejega</b>. Yeh saabit nahi karta ki router use <b>accept</b> karega. Doosri file <code>baseline-r2.cfg</code> mein typo hai:</p>
`+c+`
<p>Plan khushi se <code>communty</code> list karta hai. Sirf router keh sakta hai ki yeh invalid hai, aur woh push ke waqt kehta hai. Isliye pattern mein steps 5 aur 6 hain, aur isliye dry run pattern ka ek step hai, poora pattern nahi.</p>

<h3>Push se pehle ke errors</h3>
<p>Do galtiyan kisi router ko chhune se pehle pakdi jaati hain, aur dono tool ko exit code 1 se rok deti hain:</p>
`+l+`
<p>Anjaan naam tameez se handle hota hai, kyunki <code>lookup()</code> ek vakya ke saath <code>SystemExit</code> raise karta hai. Missing baseline file traceback deti hai, jo imaandar hai par shor wali; <b>py-tools</b> dikhata hai ki use friendly message kaise banate hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Khatarnak action ko default banana. Preview ko "test" kehna aur use acceptance ka saboot maan lena. Aisa plan print karna jo woh lines bhi list kare jo router ke paas pehle se hain, jisse harmless re-run change jaisa dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>store_true</code> options type na karo to <code>False</code> hote hain. Command line ka <code>--apply</code> code mein <code>args.apply</code> ban jaata hai.</p></div>

<div class="scn"><h4>Paste kiya hua command</h4><p>Ek engineer ne lambe din ke ant mein purane ticket se command terminal mein copy kiya. Woh script ka naam tha, router ka naam, aur kuch nahi. Tool dry-run by default hai, isliye output plan tha, aur engineer ne dekha ki aise router par 14 lines add hone wali hain jise ek bhi nahi chahiye thi. Galat baseline file ab bhi default thi, aur dry run ne kuch badalne se pehle use ujagar kar diya.</p><p><b>Lesson:</b> safe default galti ko message bana deta hai.</p></div>

<div class="iv"><p class="q">"Dry run kya hai aur ise kaise implement karte ho?"</p><p>Yeh aisa run hai jo saari reading aur comparing karta hai aur kisi change se pehle ruk jaata hai. Main ise default rakhta hoon aur <code>action="store_true"</code> ke saath explicit <code>--apply</code> switch jodta hoon, taaki device badalne ke liye hamesha jaanbujhkar ek extra shabd lage. Main iski seema bhi batata hoon: yeh dikhata hai kya bheja jaayega, yeh nahi ki device accept karega ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dry run default hai; <code>--apply</code> opt-in switch hai (<code>store_true</code>).</li>
<li>Plan hai <code>[ln for ln in wanted if ln not in before]</code>: sirf missing, poori lines.</li>
<li>Dry run local backup likhta hai par router ko kabhi nahi chhuta.</li>
<li>Preview aisi line nahi pakad sakta jo router reject karega; push aur verify steps yeh karte hain.</li>
</ul></div>
`}};export{u as default};