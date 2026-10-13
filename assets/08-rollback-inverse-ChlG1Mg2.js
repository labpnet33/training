var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n,r,i,a)=>`<rect x="`+t+`" y="`+n+`" width="`+r+`" height="34" rx="8" fill="`+i+`"/>`+e(t+r/2,n+22,a),n=(n,r)=>`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lines are undone in the reverse order of the push">`+e(150,22,n[0],`svg-muted`,12)+e(490,22,n[1],`svg-muted`,12)+t(20,36,260,`#fed7aa`,`1  no ip domain lookup`)+t(20,82,260,`#fed7aa`,`2  ntp server 10.99.0.50`)+t(20,128,260,`#fed7aa`,`3  snmp-server community NKRO RO`)+t(360,36,260,`#bbf7d0`,`1  no snmp-server community NKRO RO`)+t(360,82,260,`#bbf7d0`,`2  no ntp server 10.99.0.50`)+t(360,128,260,`#bbf7d0`,`3  ip domain lookup`)+`<line x1="282" y1="145" x2="358" y2="53" stroke="#64748b" stroke-width="2"/><line x1="282" y1="99" x2="358" y2="99" stroke="#64748b" stroke-width="2"/><line x1="282" y1="53" x2="358" y2="145" stroke="#64748b" stroke-width="2"/><rect x="20" y="174" width="600" height="30" rx="8" fill="#e2e8f0"/>`+e(320,194,n[2],`svg-ink`,12)+`</svg><p class="cap">`+r+`</p></div>`,r=`<pre class="code">def inverse(line):
    return line[3:] if line.startswith("no ") else "no " + line</pre>`,i=`<pre class="code">def inverse(line):
    return line[3:] if line.startswith("no ") else "no " + line


todo = ["no ip domain lookup", "ntp server 10.99.0.50", "snmp-server community NKRO RO"]
print([inverse(ln) for ln in todo])
print([inverse(ln) for ln in reversed(todo)])
print(inverse(inverse("ntp server 10.99.0.50")))</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ python3 inv.py</span>
['ip domain lookup', 'no ntp server 10.99.0.50', 'no snmp-server community NKRO RO']
<span class="hl">['no snmp-server community NKRO RO', 'no ntp server 10.99.0.50', 'ip domain lookup']</span>
ntp server 10.99.0.50</pre>`,o=`<pre class="code">    if rejected or missing:
        print("FAILED - rolling back")
        for ln in rejected:
            print("  the router rejected:", ln)
        conn.send_config_set([inverse(ln) for ln in reversed(todo)])
        restored = clean(conn.send_command("show running-config"))
        status = "rolled_back" if restored == before else "ROLLBACK_INCOMPLETE"
        print("config is identical to the backup" if status == "rolled_back" else "config differs from the backup!")</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ sed -i 's/communty/community/' baseline-r2.cfg</span>
<span class="hl">AUTO01$ python3 safepush.py R2 --baseline baseline-r2.cfg --apply</span>
R2: 4 of 4 baseline lines to add
  + no ip domain lookup
  + ntp server 10.99.0.50
  + snmp-server community NKRO RO
  + logging host 10.99.0.51
<span class="hl">applied 4 lines and verified them, diff saved to changes/R2.diff</span></pre>`,c=`<pre class="out"><span class="hl">AUTO01$ grep -n "service" backups/R1-before.cfg</span>
2:service timestamps debug datetime msec
3:service timestamps log datetime msec
4:no service password-encryption
<span class="hl">AUTO01$ python3 safepush.py R1</span>
R1: 0 of 6 baseline lines to add
nothing to do
<span class="hl">AUTO01$ grep -n "service" backups/R1-before.cfg</span>
2:service timestamps debug datetime msec
3:service timestamps log datetime msec
<span class="hl">4:service password-encryption</span></pre>`,l={id:`rollback-inverse`,h:{en:`Rolling back: inverse commands, reverse order, and the "no" trap`,hi:`Rollback: inverse commands, ulta order, aur "no" ka jaal`},body:{en:`
<p><b>The idea of this chapter:</b> a failed push is only half the story; the tool must also leave the router as it found it. Rolling back means sending the opposite of every line that was pushed, in the opposite order, and then <b>proving</b> that the router matches the backup.</p>

<h3>Analogy: getting dressed in reverse</h3>
<p>You put on socks, then shoes. To undo it you take off the shoes first, then the socks. Reverse the order and you trip over your own laces. Configuration lines can depend on each other in the same way: you create an object, then something uses it. To remove them you remove the user first and the object last.</p>

<h3>The inverse of a line</h3>
<p>On Cisco IOS the opposite of a command is the same command with <code>no</code> in front. The opposite of a command that already starts with <code>no</code> is the command without it. The tool has a two-line function for that:</p>
`+r+`
<p>Why the second case matters: the baseline contains <code>no ip domain lookup</code>. A naive undo that always writes <code>"no " + line</code> would produce <code>no no ip domain lookup</code>, which the router rejects (you saw exactly that command rejected in Chapter 6). The line you wanted to undo would stay in place. Try the function on its own with <code>inv.py</code>:</p>
`+i+`
`+a+`
<p>Line 1 is the inverse of each line in push order. Line 2 is what the tool really sends, in <b>reverse</b> order: the last line pushed is the first one undone. The last print shows that taking the inverse twice gives back the original line, a good sanity check for any inverse function.</p>

`+n([`Push order`,`Undo order`,`The inverse of "no x" is x. The inverse of x is "no x". Never "no no x".`],`Undo in reverse order, using the right inverse for each line.`)+`

<h3>The rollback block</h3>
`+o+`
<ul>
<li>It runs when the push was rejected or a line is missing (Chapters 6 and 7).</li>
<li>It prints the reason: <code>FAILED - rolling back</code>, then each rejected line.</li>
<li>It undoes <b>all</b> of <code>todo</code>, not only the lines that failed. Part of the change is not a safe place to stop. The router may print another error for the inverse of a line it never accepted (here <code>no snmp-server communty NKRO RO</code>); that is harmless, because the final check does not read messages.</li>
<li>It reads the configuration again and compares the whole cleaned list with the backup taken at the start: <code>restored == before</code>. Equal means <code>rolled_back</code>. Different means <code>ROLLBACK_INCOMPLETE</code>.</li>
</ul>
<p>You have already seen the good ending on R2 (Chapter 6): <code>config is identical to the backup</code>. After a clean rollback the router is exactly as it was, so the next attempt starts from the same plan. This is Lab 1, task 5: fix the typo and push again.</p>
`+s+`

<h3>Two statuses, two meanings</h3>
<table class="cmp"><tr><th>Status</th><th>Meaning</th><th>Who acts</th></tr>
<tr><td><code>rolled_back</code></td><td>The change failed, but the router is identical to the backup.</td><td>Fix the cause, run again. No emergency.</td></tr>
<tr><td><code>ROLLBACK_INCOMPLETE</code></td><td>The change failed and the undo did not restore everything.</td><td>A human must compare the router with <code>backups/R1-before.cfg</code> now.</td></tr></table>
<p>The capital letters are deliberate: the second status is a page, not a note. Lab 2 gives you a tool that reports it, caused by the "no" trap above.</p>

<h3>Limits you should know</h3>
<ul>
<li><b>Replace-style commands.</b> A command that changes a value (for example a timer) is not undone by <code>no</code> into the old value; <code>no</code> returns to the default. The equality check <code>restored == before</code> exists to catch such cases and call them incomplete.</li>
<li><b>The backup file is overwritten.</b> The tool saves <code>backups/R1-before.cfg</code> at the start of <b>every</b> run, even a dry run or a "nothing to do" run. Run it again after a successful push and the file now holds the new state:</li>
</ul>
`+c+`
<p>The first grep was run right after the push of task 3; the second after one more run. The pre-change copy is gone, and a rollback tomorrow would have nothing to go back to. Real tools write a new file every time (a timestamp in the name) or commit the backup to git, as in <b>auto-git</b>. Treat this as a known weakness of the lab tool and fix it in your own version.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>"no " + line</code> for every line. Undoing in the same order as the push. Undoing only the lines that failed. Declaring success without comparing the router with the backup.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>no no x</code> is invalid. The inverse of a <code>no</code> line removes the word <code>no</code>. A rollback is complete only when the configuration is verified equal to the backup.</p></div>

<div class="scn"><h4>The undo that undid nothing</h4><p>A script pushed <code>no ip h&#116;tp server</code> style hardening lines, hit an error on line 5 and "rolled back" by sending <code>no</code> in front of every line. For the <code>no ...</code> lines that produced <code>no no ...</code>, which the routers rejected. The script printed "rollback done" because nobody compared the result. Two hardening lines stayed active on a router that needed the old behaviour, and a service stopped working.</p><p><b>Lesson:</b> build the inverse correctly and prove the rollback by comparing with the backup.</p></div>

<div class="iv"><p class="q">"How do you roll back an automated change?"</p><p>I keep the list of lines that were pushed. To undo them I send the inverse of each, in reverse order, where the inverse of a <code>no</code> line is the line without <code>no</code>. Then I read the configuration again and compare it with the backup taken before the change. If it is equal I log <code>rolled_back</code>; if not I log a loud status such as <code>ROLLBACK_INCOMPLETE</code> and a human takes over with the backup in hand.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inverse: <code>x</code> becomes <code>no x</code>, and <code>no x</code> becomes <code>x</code>; never <code>no no x</code>.</li>
<li>Undo all pushed lines, in reverse order.</li>
<li>Prove it: <code>restored == before</code> gives <code>rolled_back</code>, otherwise <code>ROLLBACK_INCOMPLETE</code>.</li>
<li>The lab tool overwrites its backup on every run; keep timestamped or committed copies in real life.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> failed push sirf aadhi kahani hai; tool ko router bhi waisa chhodna hai jaisa mila tha. Rollback matlab har pushed line ka ulta, ulte order mein, bhejna, aur phir <b>saabit</b> karna ki router backup se match karta hai.</p>

<h3>Analogy: ulte kram mein kapde utaarna</h3>
<p>Aap pehle moze pehente ho, phir joote. Undo karne ke liye pehle joote utaarte ho, phir moze. Order ulta karoge to apne hi fite mein ulajh jaoge. Configuration lines bhi isi tarah ek-doosre par depend kar sakti hain: aap ek object banate ho, phir koi use istemaal karta hai. Hatane ke liye pehle istemaal karne wale ko hatate ho, object ko sabse aakhir mein.</p>

<h3>Line ka inverse</h3>
<p>Cisco IOS mein command ka ulta wahi command hai jiske aage <code>no</code> lagao. Jo command pehle se <code>no</code> se shuru hota hai uska ulta <code>no</code> ke bina wala command hai. Tool ke paas iske liye do line ka function hai:</p>
`+r+`
<p>Doosra case kyon matter karta hai: baseline mein <code>no ip domain lookup</code> hai. Jo naive undo hamesha <code>"no " + line</code> likhta hai, woh <code>no no ip domain lookup</code> banayega, jise router reject karta hai (aapne Chapter 6 mein yahi command reject hote dekha). Jis line ko undo karna tha woh wahin rehti. Function ko akele <code>inv.py</code> se try karo:</p>
`+i+`
`+a+`
<p>Line 1 push order mein har line ka inverse hai. Line 2 woh hai jo tool sach mein bhejta hai, <b>ulte</b> order mein: aakhri push ki hui line sabse pehle undo hoti hai. Aakhri print dikhata hai ki inverse do baar lene par original line wapas aati hai, jo kisi bhi inverse function ke liye achhi sanity check hai.</p>

`+n([`Push order`,`Undo order`,`"no x" ka inverse x hai. x ka inverse "no x" hai. Kabhi "no no x" nahi.`],`Ulte order mein undo karo, har line ke sahi inverse ke saath.`)+`

<h3>Rollback block</h3>
`+o+`
<ul>
<li>Yeh tab chalta hai jab push reject hua ho ya koi line missing ho (Chapters 6 aur 7).</li>
<li>Yeh wajah print karta hai: <code>FAILED - rolling back</code>, phir har rejected line.</li>
<li>Yeh <code>todo</code> ki <b>saari</b> lines undo karta hai, sirf fail hui nahi. Change ka aadha hissa rukne ki safe jagah nahi hai. Router us line ke inverse par aur error print kar sakta hai jo usne kabhi accept hi nahi ki (yahan <code>no snmp-server communty NKRO RO</code>); yeh harmless hai, kyunki aakhri check messages nahi padhta.</li>
<li>Yeh configuration phir padhta hai aur poori cleaned list ko shuru mein liye backup se compare karta hai: <code>restored == before</code>. Barabar ho to <code>rolled_back</code>. Alag ho to <code>ROLLBACK_INCOMPLETE</code>.</li>
</ul>
<p>Achha ant aap R2 par dekh chuke ho (Chapter 6): <code>config is identical to the backup</code>. Saaf rollback ke baad router bilkul waisa hai jaisa tha, isliye agla attempt usi plan se shuru hota hai. Yeh Lab 1, task 5 hai: typo theek karo aur dobara push karo.</p>
`+s+`

<h3>Do status, do matlab</h3>
<table class="cmp"><tr><th>Status</th><th>Matlab</th><th>Kaun action le</th></tr>
<tr><td><code>rolled_back</code></td><td>Change fail hua, par router backup jaisa hi hai.</td><td>Wajah theek karo, dobara chalao. Emergency nahi.</td></tr>
<tr><td><code>ROLLBACK_INCOMPLETE</code></td><td>Change fail hua aur undo sab restore nahi kar paya.</td><td>Insaan ko abhi router ko <code>backups/R1-before.cfg</code> se compare karna hai.</td></tr></table>
<p>Capital letters jaanbujhkar hain: doosra status note nahi, page hai. Lab 2 mein aapko aisa tool milta hai jo yeh report karta hai, upar ke "no" jaal ki wajah se.</p>

<h3>Seemaayein jo jaanni chahiye</h3>
<ul>
<li><b>Replace-style commands.</b> Jo command value badalta hai (jaise timer) use <code>no</code> purani value par wapas nahi laata; <code>no</code> default par laata hai. <code>restored == before</code> equality check aise cases pakadne aur unhe incomplete kehne ke liye hai.</li>
<li><b>Backup file overwrite hoti hai.</b> Tool <code>backups/R1-before.cfg</code> <b>har</b> run ke shuru mein save karta hai, dry run ya "nothing to do" run mein bhi. Successful push ke baad dobara chalao aur file mein ab naya state hai:</li>
</ul>
`+c+`
<p>Pehla grep task 3 ke push ke turant baad chalaya; doosra ek aur run ke baad. Change se pehle ki copy chali gayi, aur kal ka rollback jaane ke liye kuch nahi paayega. Asli tools har baar nayi file likhte hain (naam mein timestamp) ya backup git mein commit karte hain, jaise <b>auto-git</b> mein. Ise lab tool ki jaani-pehchani kamzori maano aur apne version mein theek karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Har line ke liye <code>"no " + line</code> use karna. Undo push wale hi order mein karna. Sirf fail hui lines undo karna. Router ko backup se compare kiye bina success ghoshit kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>no no x</code> invalid hai. <code>no</code> wali line ka inverse <code>no</code> shabd hata deta hai. Rollback tabhi poora hai jab configuration backup ke barabar verify ho.</p></div>

<div class="scn"><h4>Undo jisne kuch undo nahi kiya</h4><p>Ek script ne <code>no ip h&#116;tp server</code> jaisi hardening lines push kin, line 5 par error aayi aur har line ke aage <code>no</code> bhejkar "rollback" kiya. <code>no ...</code> wali lines ke liye yeh <code>no no ...</code> bana, jise routers ne reject kiya. Script ne "rollback done" print kiya kyunki kisi ne result compare nahi kiya. Do hardening lines us router par active rahin jise purana behaviour chahiye tha, aur ek service band ho gayi.</p><p><b>Lesson:</b> inverse sahi banao aur rollback ko backup se compare karke saabit karo.</p></div>

<div class="iv"><p class="q">"Automated change ko roll back kaise karte ho?"</p><p>Main pushed lines ki list rakhta hoon. Undo ke liye har line ka inverse, ulte order mein, bhejta hoon, jahan <code>no</code> line ka inverse <code>no</code> ke bina wali line hai. Phir configuration phir padhta hoon aur change se pehle liye backup se compare karta hoon. Barabar ho to <code>rolled_back</code> log karta hoon; nahi to <code>ROLLBACK_INCOMPLETE</code> jaisa zor se bolne wala status log karta hoon aur insaan backup haath mein lekar sambhalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inverse: <code>x</code> se <code>no x</code>, aur <code>no x</code> se <code>x</code>; kabhi <code>no no x</code> nahi.</li>
<li>Saari pushed lines undo karo, ulte order mein.</li>
<li>Saabit karo: <code>restored == before</code> se <code>rolled_back</code>, warna <code>ROLLBACK_INCOMPLETE</code>.</li>
<li>Lab tool har run par apna backup overwrite karta hai; asli zindagi mein timestamp wali ya committed copies rakho.</li>
</ul></div>
`}};export{l as default};