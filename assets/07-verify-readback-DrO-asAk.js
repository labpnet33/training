var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`start`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Verification compares the pushed lines with the config read back"><rect x="10" y="10" width="250" height="110" rx="10" fill="#fed7aa"/>`+e(24,32,t[0],`svg-muted`,11)+e(24,58,`ntp server 10.99.0.50`)+e(24,80,`logging 10.99.0.99`)+e(24,102,`ip ssh time-out 60`)+`<rect x="380" y="10" width="250" height="110" rx="10" fill="#bae6fd"/>`+e(394,32,t[1],`svg-muted`,11)+e(394,58,`ntp server 10.99.0.50`)+e(394,80,`logging host 10.99.0.99`)+e(394,102,`ip ssh time-out 60`)+`<line x1="260" y1="65" x2="380" y2="65" stroke="#64748b" stroke-width="2"/>`+e(320,56,`ln in after?`,`svg-ink`,12,`middle`)+`<rect x="10" y="132" width="620" height="48" rx="10" fill="#fecaca"/>`+e(24,153,t[2],`svg-ink`,12)+e(24,171,t[3],`svg-muted`,11)+`</svg><p class="cap">`+n+`</p></div>`,n=`<pre class="code">    out = conn.send_config_set(todo)
    rejected = rejected_lines(out)
    after = clean(conn.send_command("show running-config"))      <span class="c"># read it back</span>
    missing = [ln for ln in todo if ln not in after]             <span class="c"># which pushed lines are absent?</span></pre>`,r=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R1 --apply</span>
R1: 5 of 6 baseline lines to add
  + service password-encryption
  + no ip domain lookup
  + logging host 10.99.0.51
  + snmp-server community NKRO RO
  + ip ssh time-out 60
<span class="hl">applied 5 lines and verified them, diff saved to changes/R1.diff</span>
<span class="hl">AUTO01$ cat changes/R1.diff</span>
--- before
+++ after
@@ -1,11 +1,12 @@
 version 2.0
 service timestamps debug datetime msec
 service timestamps log datetime msec
<span class="hl">-no service password-encryption
+service password-encryption</span>
 hostname PUN-CORE-R1
 boot-start-marker
 boot-end-marker
 no aaa new-model
+no ip domain lookup
 ip domain name nk.lab
 username netops privilege 15 secret 9 $9$2foue0cr7twi1r$ue0cr7twi1rgdher2foue0cr7twi1rgdher
 interface GigabitEthernet0/0
@@ -23,7 +24,10 @@
  no ip address
  shutdown
  negotiation auto
+ip ssh time-out 60
 ip ssh version 2
+logging host 10.99.0.51
+snmp-server community NKRO RO
 ip forward-protocol nd
 no ip h&#116;tp server
 ntp server 10.99.0.50</pre>`,i=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R1 --apply</span>
<span class="hl">R1: 0 of 6 baseline lines to add</span>
nothing to do</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ cat short.cfg</span>
logging 10.99.0.99
<span class="hl">AUTO01$ python3 safepush.py R1 --baseline short.cfg --apply</span>
R1: 1 of 1 baseline lines to add
  + logging 10.99.0.99
<span class="hl">FAILED - rolling back</span>
config is identical to the backup
<span class="hl">AUTO01$ tail -1 changes.log</span>
{"time": "2026-09-29 09:00:30", "host": "R1", "status": "rolled_back", "lines": 1}</pre>`,o={id:`verify-readback`,h:{en:`Verify by reading the configuration back`,hi:`Configuration wapas padhkar verify karna`},body:{en:`
<p><b>The idea of this chapter:</b> do not trust the push; check the result. After the lines are sent, the tool asks the router for its configuration again and confirms that every line it meant to add is there. It is a second, independent check, and it catches problems the router never complained about.</p>

<h3>Analogy: the bank statement</h3>
<p>You transfer money and the app says "success". A careful person still looks at the statement later and checks that the amount left one account and arrived in the other. Pressing the button and checking the outcome are two different actions. In the tool, <code>send_config_set</code> is the button; reading the configuration back is the statement.</p>

<h3>The read-back in code</h3>
`+n+`
<ul>
<li>The same <code>clean()</code> from Chapter 3 is applied, so the two lists are comparable.</li>
<li><code>missing</code> keeps every pushed line that is <b>not</b> in the new list. Whole lines again, not substrings.</li>
<li>If <code>missing</code> is empty and <code>rejected</code> is empty, the push is judged good.</li>
</ul>
<p>Two checks, because they catch different failures. <code>rejected</code> catches what the router said out loud. <code>missing</code> catches what the router accepted quietly but did not store in the form you expected.</p>

<h3>Lab 1, task 3: the real push to R1</h3>
<p>All six steps run now. After the push the tool saves a diff of the cleaned before and after configurations (Chapter 4) in <code>changes/R1.diff</code>. This is the evidence you attach to the change ticket.</p>
`+r+`
<p>Look at the diff. The change only <b>added</b> five lines, yet one line was <b>removed</b>: <code>no service password-encryption</code>. This is the simulated router normalising its output. While the feature is off, the router prints an explicit <code>no service password-encryption</code> line. When the feature is switched on the router stops printing that line and prints <code>service password-encryption</code> instead, so the diff shows a minus and a plus. Other defaults behave the other way round: <code>no ip domain lookup</code> did not appear at all until it was switched off, and now it appears as a plus line. This is the reason you never guess what a line will look like; you read it back and diff.</p>
<p>Also note where the new lines landed. The router stored <code>ip ssh time-out 60</code> before <code>ip ssh version 2</code> and <code>logging host</code> near the end, not in the order the baseline lists them. Order is the router's choice (Chapter 3), so the tool tests membership, not position.</p>
<p>Run the tool again and the plan is empty, which proves the baseline is in place and that the tool is idempotent:</p>
`+i+`
`+t([`lines we pushed`,`config read back, cleaned`,`FAILED: logging 10.99.0.99 is not in the new config`,`Accepted with no % message, but stored as "logging host 10.99.0.99".`],`Verification compares what we meant with what the router stored.`)+`

<h3>Accepted but not stored the way you wrote it</h3>
<p>Many IOS commands have friendlier spellings than the form the router prints. The router accepts <code>snmp-server community NKRO ro</code> and stores <code>snmp-server community NKRO RO</code>. The same is true of <code>logging 10.99.0.51</code>, which is stored as <code>logging host 10.99.0.51</code>. Try the second one after you finish the tasks, with a one-line file <code>short.cfg</code> that contains <code>logging 10.99.0.99</code> (the push is rolled back, so R1 is not changed):</p>
`+a+`
<p>There is no <code>the router rejected</code> line, because no <code>%</code> error came back. The tool failed the push on the read-back alone: the exact line it sent is not in the new list. Two lessons follow. First, verification is not decoration; here it was the only check that noticed anything. Second, the baseline file should contain each line <b>exactly as the router prints it</b>. Copy lines from <code>show running-config</code>, do not type them from memory.</p>

<h3>What read-back does not prove</h3>
<p>It proves the configuration is there, not that it works. NTP can be configured and still unsynchronised; a logging host can be present and unreachable. Checking behaviour (a ping, <code>show ntp status</code>) is the job of testing, which the module <b>auto-testing</b> covers with pre- and post-change checks. Also note that these changes live in the running configuration. The tool does not save to startup. A reload would discard them, so saving (<code>conn.save_config()</code>, which sends <code>write mem</code>) is a separate, deliberate decision after verification and sign-off.</p>

<div class="warn"><p><b>Common mistakes.</b> Verifying with the router's reply text only. Comparing the entire config before and after instead of the pushed lines (other, unrelated changes by a colleague would fail your check). Typing baseline lines in a friendlier form than the router prints them. Forgetting that read-back needs the same <code>clean()</code> as the backup.</p></div>
<div class="exam"><p><b>Exam trap.</b> "No error message" does not mean "configured as intended". Verification by read-back is a separate step with its own failure mode.</p></div>

<div class="scn"><h4>Thirty routers, non-compliant every night</h4><p>A nightly compliance job compared every router with the baseline file and flagged all thirty routers every morning. The file said <code>snmp-server community NKRO ro</code> and the routers print <code>RO</code>. The team spent days hunting a problem that did not exist.</p><p><b>Lesson:</b> write baseline lines exactly as the router prints them, and let a read-back prove it.</p></div>

<div class="iv"><p class="q">"Why read the config back after a push? Doesn't a lack of errors mean it worked?"</p><p>No. The router can accept a command and store it in a different form, or skip it. I read the running configuration again, clean it, and check that each line I pushed is present as a whole line. I save a before-and-after diff as evidence. For behaviour I add separate tests, because configuration present is not the same as service working.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verification reads the config again and checks <code>ln in after</code> for each pushed line.</li>
<li>A push is good only if nothing was rejected and nothing is missing.</li>
<li>Routers normalise: <code>ro</code> becomes <code>RO</code>, and the explicit <code>no service password-encryption</code> line is replaced when the feature is on.</li>
<li>Write baseline lines exactly as <code>show running-config</code> prints them; save the diff as evidence.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> push par bharosa mat karo; result check karo. Lines bhejne ke baad tool router se configuration phir maangta hai aur confirm karta hai ki jo lines add karni thi woh sab maujood hain. Yeh doosra, swatantra check hai, aur woh problems pakadta hai jinki router ne shikayat hi nahi ki.</p>

<h3>Analogy: bank statement</h3>
<p>Aap paise transfer karte ho aur app kehta hai "success". Samajhdaar insaan phir bhi baad mein statement dekhta hai aur check karta hai ki amount ek account se gaya aur doosre mein aaya. Button dabana aur result check karna do alag kaam hain. Tool mein <code>send_config_set</code> button hai; configuration wapas padhna statement hai.</p>

<h3>Code mein read-back</h3>
`+n+`
<ul>
<li>Chapter 3 wala wahi <code>clean()</code> lagta hai, taaki dono lists comparable hon.</li>
<li><code>missing</code> har pushed line rakhta hai jo nayi list mein <b>nahi</b> hai. Phir poori lines, substrings nahi.</li>
<li><code>missing</code> khaali ho aur <code>rejected</code> khaali ho, to push theek maana jaata hai.</li>
</ul>
<p>Do checks, kyunki woh alag failures pakadte hain. <code>rejected</code> woh pakadta hai jo router ne zor se kaha. <code>missing</code> woh pakadta hai jo router ne chupchaap accept kiya par us form mein store nahi kiya jis form ki aapne ummeed ki thi.</p>

<h3>Lab 1, task 3: R1 par asli push</h3>
<p>Ab chhe ke chhe steps chalte hain. Push ke baad tool cleaned before aur after configurations ka diff (Chapter 4) <code>changes/R1.diff</code> mein save karta hai. Yahi saboot hai jo aap change ticket ke saath lagate ho.</p>
`+r+`
<p>Diff dekho. Change ne sirf paanch lines <b>add</b> ki, phir bhi ek line <b>hati</b>: <code>no service password-encryption</code>. Yeh simulated router apna output normalise kar raha hai. Feature off ho tab router explicit <code>no service password-encryption</code> line print karta hai. Feature on karte hi router woh line print karna band kar deta hai aur uski jagah <code>service password-encryption</code> print karta hai, isliye diff mein ek minus aur ek plus dikhta hai. Doosre defaults ulta karte hain: <code>no ip domain lookup</code> off karne tak dikha hi nahi, aur ab plus line ki tarah dikhta hai. Isi liye aap kabhi andaaza nahi lagate ki line kaisi dikhegi; wapas padhte ho aur diff karte ho.</p>
<p>Yeh bhi dekho ki nayi lines kahan padi. Router ne <code>ip ssh time-out 60</code> ko <code>ip ssh version 2</code> se pehle aur <code>logging host</code> ko ant ke paas rakha, us order mein nahi jisme baseline unhe likhti hai. Order router ki pasand hai (Chapter 3), isliye tool position nahi, membership test karta hai.</p>
<p>Tool dobara chalao aur plan khaali hai, jo saabit karta hai ki baseline maujood hai aur tool idempotent hai:</p>
`+i+`
`+t([`jo lines humne push ki`,`wapas padhi config, cleaned`,`FAILED: logging 10.99.0.99 nayi config mein nahi hai`,`Bina % message ke accept hui, par "logging host 10.99.0.99" ki tarah store hui.`],`Verification dekhta hai humne kya chaha aur router ne kya store kiya.`)+`

<h3>Accept hui par waise store nahi jaise likhi</h3>
<p>Kai IOS commands ke spelling router ke print kiye form se zyada dostana hote hain. Router <code>snmp-server community NKRO ro</code> accept karta hai aur <code>snmp-server community NKRO RO</code> store karta hai. <code>logging 10.99.0.51</code> ke saath bhi aisa hi hai, jo <code>logging host 10.99.0.51</code> ki tarah store hota hai. Tasks khatam karne ke baad doosra try karo, ek line wali file <code>short.cfg</code> ke saath jisme <code>logging 10.99.0.99</code> hai (push roll back ho jaata hai, isliye R1 nahi badalta):</p>
`+a+`
<p><code>the router rejected</code> line nahi hai, kyunki koi <code>%</code> error wapas nahi aayi. Tool ne push ko sirf read-back par fail kiya: jo exact line usne bheji woh nayi list mein nahi hai. Do seekh. Pehli, verification sajaavat nahi hai; yahan wahi akela check tha jisne kuch notice kiya. Doosri, baseline file mein har line <b>bilkul waise</b> honi chahiye jaise router print karta hai. Lines <code>show running-config</code> se copy karo, yaad se type mat karo.</p>

<h3>Read-back kya saabit nahi karta</h3>
<p>Yeh saabit karta hai ki configuration maujood hai, yeh nahi ki kaam karti hai. NTP configured ho kar bhi unsynchronised ho sakta hai; logging host maujood hokar bhi unreachable ho sakta hai. Behaviour check karna (ping, <code>show ntp status</code>) testing ka kaam hai, jo <b>auto-testing</b> module pre- aur post-change checks ke saath sikhata hai. Yeh bhi dekho ki yeh changes running configuration mein rehte hain. Tool startup mein save nahi karta. Reload inhe hata dega, isliye save karna (<code>conn.save_config()</code>, jo <code>write mem</code> bhejta hai) verification aur sign-off ke baad alag, soch-samajhkar liya faisla hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Sirf router ke reply text se verify karna. Pushed lines ki jagah poori config before aur after compare karna (colleague ke alag changes aapka check fail kara denge). Baseline lines ko router ke print kiye form se zyada dostana form mein type karna. Yeh bhoolna ki read-back ko bhi backup jaisa hi <code>clean()</code> chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Koi error message nahi" ka matlab "iraade jaisa configure hua" nahi. Read-back se verification alag step hai jiska apna failure mode hai.</p></div>

<div class="scn"><h4>Tees routers, har raat non-compliant</h4><p>Ek nightly compliance job har router ko baseline file se compare karti thi aur har subah tees ke tees routers flag karti thi. File mein <code>snmp-server community NKRO ro</code> tha aur routers <code>RO</code> print karte hain. Team ne dino tak aisi problem dhoondhi jo thi hi nahi.</p><p><b>Lesson:</b> baseline lines bilkul waise likho jaise router print karta hai, aur read-back se saabit karo.</p></div>

<div class="iv"><p class="q">"Push ke baad config wapas kyon padhte ho? Error na aana matlab kaam ho gaya nahi?"</p><p>Nahi. Router command accept karke use alag form mein store kar sakta hai, ya skip kar sakta hai. Main running configuration phir padhta hoon, clean karta hoon, aur check karta hoon ki jo line maine push ki woh poori line ki tarah maujood hai. Saboot ke liye before-and-after diff save karta hoon. Behaviour ke liye alag tests jodta hoon, kyunki configuration maujood hona aur service chalna ek jaisa nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verification config phir padhta hai aur har pushed line ke liye <code>ln in after</code> check karta hai.</li>
<li>Push tabhi theek hai jab kuch reject nahi hua aur kuch missing nahi.</li>
<li>Routers normalise karte hain: <code>ro</code> <code>RO</code> ban jaata hai, aur feature on hone par explicit <code>no service password-encryption</code> line badal jaati hai.</li>
<li>Baseline lines bilkul waise likho jaise <code>show running-config</code> print karta hai; diff saboot ki tarah save karo.</li>
</ul></div>
`}};export{o as default};