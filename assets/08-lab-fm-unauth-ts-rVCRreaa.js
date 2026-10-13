var e={id:`lab-fm-unauth-ts`,h:{en:`Lab fm-unauth-ts: three FortiGates, three reasons they are not managed`,hi:`Lab fm-unauth-ts: teen FortiGates, na managed hone ke teen reasons`},body:{en:`
<p>A doctor who sees three patients with the same fever does not give all three the same medicine; each gets a test first. This troubleshooting lab gives you three branch FortiGates with one symptom, "not managed", and three different causes. It has four tasks and takes about 30 minutes. FMG-1 already has the ADOM Kaveri ready, so you do not create anything; you diagnose and repair.</p>

<div class="note"><p><b>The ticket.</b> Last week the three branch FortiGates were all pointed at FMG-1. Today only one shows up in the console. One device is connected but nobody authorized it, one calls a wrong address and one has an incomplete central-management setting. Get all three into Kaveri with conn up.</p></div>

<h3>Approach: find the cause before you change anything</h3>
<p>Use the chain of chapter 5. For each device ask: what does it say in central-management, what does it call, and what does FortiManager know about it? Change one thing, check, and then continue. A small table on paper helps: device, symptom, evidence, fix.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three devices and three symptoms">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">connected, waiting</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fed7aa"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">calls the wrong address</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">type missing</text>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: authorize</text><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: correct fmg</text><text x="535" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: set type</text>
</svg><p class="cap">Same symptom, three causes. Which box belongs to which device is what you must prove with output.</p></div>

<h3>Task 1: the unauthorized list</h3>
<p>On FMG-1 run the unauthorized list. It shows the device that is connected but not accepted. Authorize it into Kaveri (this is the easy one, as in chapter 3). The point of the task is also to notice that the list holds only one device: the other two are not even connected.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">TRY-FGT</span>     FGVMEV3X688U0000  192.0.2.13  7.6 MR0</pre>

<h3>Task 2: the wrong address</h3>
<p>HQ-FGT is not listed. First look at <code>show system central-management</code> and you may already see a suspicious address. To prove it, use the FGFM debug of chapter 5: select the daemon, enable, wait a few seconds, disable. The question asks which address is called.</p>
<pre class="out">HQ-FGT # show system central-management
config system central-management
    set type fortimanager
    set fmg "<span class="hl">192.0.2.15</span>"
end</pre>
<p>The address is one digit away from 192.0.2.5, the real FortiManager. The debug shows <code>connecting to 192.0.2.15:541</code> followed by a failure that says the connection timed out. Correct only the fmg value; the type is already right. Wrong turns: leaving debug on while you work (output scrolls over your commands), and typing 192.0.2.50, another near miss.</p>

<h3>Task 3: the incomplete setting</h3>
<p>MDU-FGT has an address and no type. Compare its output with the working branch and spot the missing line. The lab asks what the default type is and what it must be.</p>
<pre class="out">MDU-FGT # show system central-management
config system central-management
    set fmg "192.0.2.5"
end
<span class="c">no "set type" line: the type is still the default, fortiguard</span></pre>
<p>The default is fortiguard; it must be fortimanager. Notice that this device gave you no debug output at all in chapter 5; silence was the clue. After the fix, give it a few seconds, then check the unauthorized list again.</p>

<h3>Task 4: authorize the other two and verify</h3>
<p>Once HQ-FGT and MDU-FGT have called in correctly, they appear in the unauthorized list and you authorize each into Kaveri, as you did for TRY-FGT. Finish with the device list. All three should show the same healthy status line and the ADOM should report three devices.</p>
<pre class="out">FMG-1 # diagnose dvm device list
--- There are currently 3 devices/vdoms managed ---
... TRY-FGT  Kaveri ... dm: retrieved; <span class="hl">conn: up</span>
... HQ-FGT   Kaveri ... dm: retrieved; <span class="hl">conn: up</span>
... MDU-FGT  Kaveri ... dm: retrieved; <span class="hl">conn: up</span>

FMG-1 # diagnose dvm adom list
464   enabled  Kaveri  7.6  GMS  <span class="hl">3</span></pre>

<div class="eg"><p><b>Worked example.</b> A finished evidence table for this lab might read: TRY-FGT, appears in the unauthorized list, authorize; HQ-FGT, debug shows 192.0.2.15, correct the fmg address; MDU-FGT, show output has no type line, set type fortimanager. Each row has evidence, not a guess.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Authorizing in a hurry before reading the message; changing the FortiManager when all three faults are on the FortiGates; forgetting that a fixed FortiGate needs a few seconds before it shows in the list; and fixing two things at once. If a device still does not appear, return to the chain: type, address, path.</p></div>

<div class="exam"><p><b>Exam traps.</b> A missing line in a show output means default. Silence in the FGFM debug can mean the type is not fortimanager. The unauthorized list only holds devices that are really connected. The real product also shows connection state in the device manager with more detail than this simulator.</p></div>

<div class="scn"><h4>The ticket that closed itself after three fixes</h4><p>A service desk ticket read: "FortiManager does not see our branches". The engineer did not touch FMG-1. She read the unauthorized list, one device; compared the central-management output of the other two and found a wrong address and a missing type. After the fixes and two authorizations she attached the device list as proof.</p><p><b>Lesson:</b> write down the cause for each device. A single fix for a plural symptom is almost always wrong.</p></div>

<div class="iv"><p class="q">"Several FortiGates are not visible on FortiManager. How do you separate the causes?"</p><p>I start with the unauthorized list for devices that are connected, then look at central-management and the fgfmsd debug on each missing device. Wrong address shows in the debug, a missing type shows as silence and a default in show. I fix one device at a time and finish with the device list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One symptom can have several causes; diagnose per device.</li>
<li>Connected but waiting means authorize; nothing in the list means check the FortiGate.</li>
<li>The fgfmsd debug shows the address that is really called.</li>
<li>Default type fortiguard must be changed to fortimanager.</li>
<li>Finish with diagnose dvm device list: all conn up.</li>
</ul></div>
`,hi:`
<p>Jo doctor teen patients ko ek jaisa bukhar ke saath dekhta hai wo teeno ko ek hi dawai nahi deta; pehle har ek ka test hota hai. Ye troubleshooting lab aapko teen branch FortiGates deta hai jinka symptom ek hai, "not managed", aur causes teen alag. Isme chaar tasks hain aur lagbhag 30 minute lagte hain. FMG-1 par ADOM Kaveri pehle se ready hai, isliye aap kuch banate nahi; diagnose aur repair karte ho.</p>

<div class="note"><p><b>Ticket.</b> Pichhle hafte teeno branch FortiGates FMG-1 par point kiye gaye the. Aaj console mein sirf ek dikhta hai. Ek device connected hai par kisi ne authorize nahi kiya, ek galat address ko call karta hai aur ek ki central-management setting adhuri hai. Teeno ko conn up ke saath Kaveri mein laao.</p></div>

<h3>Approach: badalne se pehle cause dhoondho</h3>
<p>Chapter 5 ki chain use karo. Har device ke liye poochho: central-management mein kya likha hai, wo kise call karta hai, aur FortiManager uske baare mein kya jaanta hai? Ek cheez badlo, check karo, phir aage badho. Kagaz par chhoti table madad karti hai: device, symptom, evidence, fix.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Teen devices aur teen symptoms">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">connected, waiting</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fed7aa"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">galat address call karta hai</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">type missing</text>
<text x="105" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: authorize</text><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: fmg sahi karo</text><text x="535" y="125" text-anchor="middle" class="svg-accent" font-size="12">fix: type set karo</text>
</svg><p class="cap">Ek symptom, teen causes. Kaun sa box kis device ka hai, ye aapko output se prove karna hai.</p></div>

<h3>Task 1: unauthorized list</h3>
<p>FMG-1 par unauthorized list chalao. Wo us device ko dikhati hai jo connected hai par accepted nahi. Use Kaveri mein authorize karo (ye aasan hai, jaise chapter 3 mein). Task ka point ye bhi dekhna hai ki list mein sirf ek device hai: baaki do connected hi nahi hain.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">TRY-FGT</span>     FGVMEV3X688U0000  192.0.2.13  7.6 MR0</pre>

<h3>Task 2: galat address</h3>
<p>HQ-FGT list mein nahi hai. Pehle <code>show system central-management</code> dekho aur shayad pehle se hi shak wala address dikhe. Prove karne ke liye chapter 5 ka FGFM debug use karo: daemon chuno, enable, kuch seconds wait, disable. Sawaal poochta hai kaun sa address call ho raha hai.</p>
<pre class="out">HQ-FGT # show system central-management
config system central-management
    set type fortimanager
    set fmg "<span class="hl">192.0.2.15</span>"
end</pre>
<p>Address asli FortiManager 192.0.2.5 se sirf ek digit door hai. Debug <code>connecting to 192.0.2.15:541</code> dikhata hai, uske baad ek failure jo kehta hai connection timed out. Sirf fmg value sahi karo; type pehle se theek hai. Wrong turns: kaam karte waqt debug on chhodna (output aapke commands ke upar scroll karta hai), aur 192.0.2.50 type karna, jo ek aur near miss hai.</p>

<h3>Task 3: adhuri setting</h3>
<p>MDU-FGT ke paas address hai par type nahi. Uska output working branch se compare karo aur missing line pakdo. Lab poochta hai default type kya hai aur kya hona chahiye.</p>
<pre class="out">MDU-FGT # show system central-management
config system central-management
    set fmg "192.0.2.5"
end
<span class="c">"set type" line nahi: type abhi bhi default hai, fortiguard</span></pre>
<p>Default fortiguard hai; hona fortimanager chahiye. Dhyan do ki chapter 5 mein is device ne koi debug output nahi diya; khamoshi hi clue thi. Fix ke baad kuch seconds do, phir unauthorized list dobara check karo.</p>

<h3>Task 4: baaki do ko authorize karo aur verify karo</h3>
<p>Jab HQ-FGT aur MDU-FGT sahi call in kar lete hain, wo unauthorized list mein aate hain aur aap har ek ko Kaveri mein authorize karte ho, jaise TRY-FGT ko kiya. Device list par khatam karo. Teeno ki same healthy status line honi chahiye aur ADOM teen devices report kare.</p>
<pre class="out">FMG-1 # diagnose dvm device list
--- There are currently 3 devices/vdoms managed ---
... TRY-FGT  Kaveri ... dm: retrieved; <span class="hl">conn: up</span>
... HQ-FGT   Kaveri ... dm: retrieved; <span class="hl">conn: up</span>
... MDU-FGT  Kaveri ... dm: retrieved; <span class="hl">conn: up</span>

FMG-1 # diagnose dvm adom list
464   enabled  Kaveri  7.6  GMS  <span class="hl">3</span></pre>

<div class="eg"><p><b>Worked example.</b> Is lab ki ek poori evidence table aise padh sakti hai: TRY-FGT, unauthorized list mein dikhta hai, authorize; HQ-FGT, debug 192.0.2.15 dikhata hai, fmg address sahi karo; MDU-FGT, show output mein type line nahi, type fortimanager set karo. Har row mein evidence hai, andaza nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Message padhe bina jaldi mein authorize karna; teeno faults FortiGates par hon aur FortiManager badalna; ye bhoolna ki fix hue FortiGate ko list mein aane ke liye kuch seconds chahiye; aur do cheezein ek saath fix karna. Device phir bhi na dikhe to chain par wapas jao: type, address, path.</p></div>

<div class="exam"><p><b>Exam traps.</b> Show output mein line ka na hona default hota hai. FGFM debug mein khamoshi ka matlab ho sakta hai ki type fortimanager nahi hai. Unauthorized list mein sirf wahi devices hote hain jo sach mein connected hain. Real product device manager mein connection state is simulator se zyada detail mein dikhata hai.</p></div>

<div class="scn"><h4>Wo ticket jo teen fixes ke baad khud band hua</h4><p>Service desk ticket tha: "FortiManager hamari branches nahi dekhta". Engineer ne FMG-1 ko chhua hi nahi. Usne unauthorized list padhi, ek device; baaki do ka central-management output compare kiya aur galat address aur missing type mila. Fixes aur do authorizations ke baad usne device list proof ke taur par attach ki.</p><p><b>Lesson:</b> har device ka cause likho. Plural symptom ke liye ek hi fix lagbhag hamesha galat hota hai.</p></div>

<div class="iv"><p class="q">"Kai FortiGates FortiManager par nahi dikh rahe. Aap causes ko alag kaise karte ho?"</p><p>Main pehle unauthorized list se shuru karta hoon un devices ke liye jo connected hain, phir har missing device par central-management aur fgfmsd debug dekhta hoon. Galat address debug mein dikhta hai, missing type khamoshi aur show mein default ki tarah dikhta hai. Main ek time par ek device fix karta hoon aur device list par khatam karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek symptom ke kai causes ho sakte hain; per device diagnose karo.</li>
<li>Connected but waiting matlab authorize; list mein kuch nahi matlab FortiGate check karo.</li>
<li>fgfmsd debug wo address dikhata hai jo sach mein call ho raha hai.</li>
<li>Default type fortiguard ko fortimanager karna padta hai.</li>
<li>diagnose dvm device list par khatam karo: sab conn up.</li>
</ul></div>
`}};export{e as default};