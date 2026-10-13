var e={id:`lab-tracker-triage`,h:{en:`Lab: cp-tracker-triage, three tickets, three causes`,hi:`Lab: cp-tracker-triage, teen tickets, teen causes`},body:{en:`
<p>On Monday morning a doctor in a clinic sees three patients with the same complaint: "I feel unwell". A weak doctor gives all three the same medicine. A good one checks each chart and finds fever in one, low sugar in another and a sprained ankle in the third. In this lab alice, bob and the printer PRN1 all say "no access", but each has a different cause. The Access Tracker is the chart.</p>

<h3>The tickets</h3>
<ul>
<li>Alice (LAPTOP1, port 1/1/3): "I get no network."</li>
<li>Bob (LAPTOP2, port 1/1/4): "I get no network."</li>
<li>The printer (PRN1, port 1/1/5, MAC 00:50:67:fb:67:01, no supplicant): "Offline since the weekend."</li>
</ul>
<p>Tasks: list the Access Tracker and read the alert of each failing request; reset Alice's password and enable Bob's account; add PRN1 as a known printer endpoint. All repairs are on ClearPass only.</p>

<h3>Step 1: the list</h3>
<pre class="out">CPPM# monitoring access-tracker
Time      Status  User/MAC             Device  Service           Profiles
--------  ------  -------------------  ------  ----------------  --------
09:02:11  REJECT  alice                ACCESS  Wired 802.1X      -
09:02:14  REJECT  bob                  ACCESS  Wired 802.1X      -
09:02:19  REJECT  00:50:67:fb:67:01    ACCESS  Wired MAC Auth    -</pre>
<p>Three REJECTs from the right device, handled by the right services. So the NAD trust (stage 1) and service classification (stage 2) are fine. All three die at stage 3. Now read each alert.</p>

<h3>Step 2: three alerts</h3>
<pre class="out">CPPM# monitoring access-tracker detail alice alerts
  Error Code                : <span class="hl">215</span>
  Error Message             : Authentication failed: password mismatch (MSCHAPv2)

CPPM# monitoring access-tracker detail bob alerts
  Error Code                : <span class="hl">217</span>
  Error Message             : User account is disabled

CPPM# monitoring access-tracker detail 00:50:67:fb:67:01 alerts
  Error Code                : <span class="hl">216</span>
  Error Message             : Endpoint not found in the Endpoints Repository (MAC 00:50:67:fb:67:01)</pre>
<table class="cmp"><tr><th>Who</th><th>Code</th><th>Meaning</th><th>Owner of the fix</th></tr>
<tr><td>alice</td><td>215</td><td>Password in ClearPass differs from what the laptop sends</td><td>Local user repository</td></tr>
<tr><td>bob</td><td>217</td><td>Account exists but is disabled</td><td>Local user repository</td></tr>
<tr><td>PRN1</td><td>216</td><td>MAC unknown to the Endpoints Repository</td><td>Endpoints Repository</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three tickets">
<rect x="10" y="20" width="190" height="90" rx="8" fill="#fed7aa"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">alice: 215</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">password mismatch</text><text x="105" y="88" text-anchor="middle" class="svg-accent" font-size="12">reset password</text>
<rect x="225" y="20" width="190" height="90" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">bob: 217</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">account disabled</text><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">enable account</text>
<rect x="440" y="20" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">PRN1: 216</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">endpoint unknown</text><text x="535" y="88" text-anchor="middle" class="svg-accent" font-size="12">add known endpoint</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Same symptom, three codes, three different fixes.</text>
</svg><p class="cap">Triage is reading the code before touching anything.</p></div>

<h3>Step 3: repair, one object per ticket</h3>
<pre class="code"><span class="c">! Lab shell (GUI: Configuration > Identity > Local Users / Endpoints)</span>
CPPM# configuration identity local-user alice password Pass@2024
CPPM# configuration identity local-user bob enable
CPPM# configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>
<p>In the real GUI: <b>Configuration &gt; Identity &gt; Local Users</b> for alice and bob, and <b>Configuration &gt; Identity &gt; Endpoints</b> for the printer. Setting Category=Printer matters because the RM-MAC role mapping uses the endpoint attribute Category to produce the role PRINTER, which the policy EPOL-MAC turns into EP-IOT (VLAN 30).</p>

<h3>Step 4: force a fresh attempt and prove</h3>
<p>A failed client waits for a quiet period (20 seconds in the lab model) and retries by itself. To skip waiting, bounce the ports or retry on the laptops:</p>
<pre class="code">LAPTOP1&gt; ip dhcp
LAPTOP1&gt; ping 10.20.70.20
LAPTOP2&gt; ip dhcp
LAPTOP2&gt; ping 10.20.70.20
PRN1&gt; ip dhcp
PRN1&gt; ping 10.20.70.20</pre>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address         User   Method    Status      Role       VLAN
1/1/3  00:50:2f:e9:9a:01   alice  dot1x     Authorized  EMPLOYEE   <span class="hl">10</span>
1/1/4  00:50:2f:e9:9a:02   bob    dot1x     Authorized  CONTRACTOR <span class="hl">20</span>
1/1/5  00:50:67:fb:67:01   -      mac-auth  Authorized  IOT        <span class="hl">30</span></pre>
<p>Notice the Method column: laptops by dot1x, the printer by mac-auth, because the printer has no supplicant and the switch falls over to MAC authentication after the 802.1X timeout.</p>

<div class="eg"><p><b>Worked example.</b> If PRN1 were still rejected after you added it, you would check three things in order: the endpoint status is <i>known</i> (not disabled), the MAC is typed with the exact digits, and the service Wired MAC Auth has the [MAC AUTH] method and the Endpoints Repository as source. A disabled status also gives alert 216 in the lab model, with the message "Endpoint status is disabled".</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing all three with one action, for example adding an "allow all" rule or putting everyone on one VLAN. It silences the tickets and destroys the policy. Another mistake is resetting Bob's password when the code said 217: the account was disabled, not forgotten.</p></div>

<div class="exam"><p><b>Exam trap.</b> 215 and 217 look alike to beginners because both are "login fails". The code tells the owner of the fix: 215 password, 217 account state, 216 existence. Also remember that disabling an account is often deliberate (leaver process); find out why before enabling it.</p></div>

<div class="scn"><h4>The contractor who left</h4><p>A user reported "disabled account" ticket. The tracker said 217. The helpdesk enabled the account and the user worked again. Two days later the security team asked why a departed contractor still had network access; HR had disabled the account on purpose and the helpdesk re-enabled the wrong person's account.</p><p><b>Lesson:</b> 217 means "someone disabled this". Confirm with the account owner or HR process before you enable.</p></div>

<div class="iv"><p class="q">"Three users report no access at once. How do you find out if it is one problem?"</p><p>I list the Access Tracker and compare codes and services, not complaints. Same code and same service suggest a shared cause; different codes mean separate fixes. Then I repair each at its owner (identity source, endpoint repository, service) and prove each user individually.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Same symptom can hide different causes; the code decides the fix.</li>
<li>215 reset the password, 217 enable the account (after checking why), 216 add or correct the identity.</li>
<li>Fix on the identity source, not in the policy.</li>
<li>Prove each device by its own method: dot1x for laptops, mac-auth for the printer.</li>
<li>Printers need status known and Category=Printer to land in IOT.</li>
</ul></div>
`,hi:`
<p>Monday subah ek clinic mein doctor teen patients dekhta hai jinki complaint same hai: "Tabiyat theek nahi". Kamzor doctor teeno ko same dawa deta hai. Achha doctor har chart check karta hai aur ek mein bukhar, doosre mein low sugar aur teesre mein moch dhoondhta hai. Is lab mein alice, bob aur printer PRN1 sab kehte hain "no access", par har ek ka cause alag hai. Access Tracker hi chart hai.</p>

<h3>Tickets</h3>
<ul>
<li>Alice (LAPTOP1, port 1/1/3): "Mujhe network nahi mil raha."</li>
<li>Bob (LAPTOP2, port 1/1/4): "Mujhe network nahi mil raha."</li>
<li>Printer (PRN1, port 1/1/5, MAC 00:50:67:fb:67:01, koi supplicant nahi): "Weekend se offline."</li>
</ul>
<p>Tasks: Access Tracker list karo aur har failing request ka alert padho; Alice ka password reset karo aur Bob ka account enable karo; PRN1 ko known printer endpoint ke roop mein add karo. Saari repairs sirf ClearPass par hain.</p>

<h3>Step 1: list</h3>
<pre class="out">CPPM# monitoring access-tracker
Time      Status  User/MAC             Device  Service           Profiles
--------  ------  -------------------  ------  ----------------  --------
09:02:11  REJECT  alice                ACCESS  Wired 802.1X      -
09:02:14  REJECT  bob                  ACCESS  Wired 802.1X      -
09:02:19  REJECT  00:50:67:fb:67:01    ACCESS  Wired MAC Auth    -</pre>
<p>Sahi device se teen REJECTs, sahi services ne handle ki. To NAD trust (stage 1) aur service classification (stage 2) theek hain. Teeno stage 3 par marte hain. Ab har alert padho.</p>

<h3>Step 2: teen alerts</h3>
<pre class="out">CPPM# monitoring access-tracker detail alice alerts
  Error Code                : <span class="hl">215</span>
  Error Message             : Authentication failed: password mismatch (MSCHAPv2)

CPPM# monitoring access-tracker detail bob alerts
  Error Code                : <span class="hl">217</span>
  Error Message             : User account is disabled

CPPM# monitoring access-tracker detail 00:50:67:fb:67:01 alerts
  Error Code                : <span class="hl">216</span>
  Error Message             : Endpoint not found in the Endpoints Repository (MAC 00:50:67:fb:67:01)</pre>
<table class="cmp"><tr><th>Kaun</th><th>Code</th><th>Meaning</th><th>Fix ka owner</th></tr>
<tr><td>alice</td><td>215</td><td>ClearPass ka password laptop ke bheje password se alag hai</td><td>Local user repository</td></tr>
<tr><td>bob</td><td>217</td><td>Account hai par disabled hai</td><td>Local user repository</td></tr>
<tr><td>PRN1</td><td>216</td><td>MAC Endpoints Repository ko unknown hai</td><td>Endpoints Repository</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three tickets">
<rect x="10" y="20" width="190" height="90" rx="8" fill="#fed7aa"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">alice: 215</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">password mismatch</text><text x="105" y="88" text-anchor="middle" class="svg-accent" font-size="12">password reset</text>
<rect x="225" y="20" width="190" height="90" rx="8" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">bob: 217</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">account disabled</text><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">account enable</text>
<rect x="440" y="20" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">PRN1: 216</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">endpoint unknown</text><text x="535" y="88" text-anchor="middle" class="svg-accent" font-size="12">known endpoint add</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Symptom same, teen codes, teen alag fixes.</text>
</svg><p class="cap">Triage ka matlab kuch chhedne se pehle code padhna.</p></div>

<h3>Step 3: repair, har ticket ke liye ek object</h3>
<pre class="code"><span class="c">! Lab shell (GUI: Configuration > Identity > Local Users / Endpoints)</span>
CPPM# configuration identity local-user alice password Pass@2024
CPPM# configuration identity local-user bob enable
CPPM# configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>
<p>Real GUI mein: alice aur bob ke liye <b>Configuration &gt; Identity &gt; Local Users</b>, aur printer ke liye <b>Configuration &gt; Identity &gt; Endpoints</b>. Category=Printer set karna important hai kyunki RM-MAC role mapping endpoint attribute Category se role PRINTER banata hai, jise EPOL-MAC policy EP-IOT (VLAN 30) mein badalti hai.</p>

<h3>Step 4: fresh attempt force karo aur prove karo</h3>
<p>Failed client quiet period (lab model mein 20 seconds) ke baad khud retry karta hai. Intezaar skip karne ke liye ports bounce karo ya laptops par retry karo:</p>
<pre class="code">LAPTOP1&gt; ip dhcp
LAPTOP1&gt; ping 10.20.70.20
LAPTOP2&gt; ip dhcp
LAPTOP2&gt; ping 10.20.70.20
PRN1&gt; ip dhcp
PRN1&gt; ping 10.20.70.20</pre>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address         User   Method    Status      Role       VLAN
1/1/3  00:50:2f:e9:9a:01   alice  dot1x     Authorized  EMPLOYEE   <span class="hl">10</span>
1/1/4  00:50:2f:e9:9a:02   bob    dot1x     Authorized  CONTRACTOR <span class="hl">20</span>
1/1/5  00:50:67:fb:67:01   -      mac-auth  Authorized  IOT        <span class="hl">30</span></pre>
<p>Method column dekho: laptops dot1x se, printer mac-auth se, kyunki printer ka supplicant nahi hai aur switch 802.1X timeout ke baad MAC authentication par fall over karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Agar PRN1 add karne ke baad bhi rejected rehta, to aap order mein teen cheezein check karte: endpoint status <i>known</i> hai (disabled nahi), MAC exact digits ke saath likha hai, aur Wired MAC Auth service mein [MAC AUTH] method aur source ke roop mein Endpoints Repository hai. Lab model mein disabled status bhi alert 216 deta hai, message "Endpoint status is disabled" ke saath.</p></div>

<div class="warn"><p><b>Common mistake.</b> Teeno ko ek action se fix karna, jaise "allow all" rule add karna ya sabko ek VLAN par daalna. Isse tickets chup ho jaate hain par policy barbaad ho jaati hai. Ek aur galti: code 217 tha aur Bob ka password reset kar diya: account disabled tha, bhoola nahi tha.</p></div>

<div class="exam"><p><b>Exam trap.</b> 215 aur 217 beginners ko ek jaise lagte hain kyunki dono "login fail" hain. Code batata hai fix ka owner kaun hai: 215 password, 217 account state, 216 existence. Yeh bhi yaad rakho ki account disable karna aksar jaan-boojhkar hota hai (leaver process); enable karne se pehle pata karo kyon.</p></div>

<div class="scn"><h4>Contractor jo chhod gaya</h4><p>Ek user ne "disabled account" ticket diya. Tracker ne 217 dikhaya. Helpdesk ne account enable kar diya aur user ka kaam chalne laga. Do din baad security team ne poochha ki chhod chuke contractor ko abhi bhi network access kyon hai; HR ne account jaan-boojhkar disable kiya tha aur helpdesk ne galat insaan ka account dobara enable kar diya.</p><p><b>Lesson:</b> 217 ka matlab "kisi ne ise disable kiya". Enable karne se pehle account owner ya HR process se confirm karo.</p></div>

<div class="iv"><p class="q">"Teen users ek saath no access report karte hain. Kaise pata chalega ki ek hi problem hai?"</p><p>Main Access Tracker list karta hoon aur complaints nahi, codes aur services compare karta hoon. Same code aur same service shared cause suggest karte hain; alag codes ka matlab alag fixes. Phir har ek ko uske owner par repair karta hoon (identity source, endpoint repository, service) aur har user ko alag prove karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Same symptom ke peeche alag causes ho sakte hain; code fix tay karta hai.</li>
<li>215 password reset, 217 account enable (pehle kyon check karke), 216 identity add ya correct.</li>
<li>Identity source par fix karo, policy mein nahi.</li>
<li>Har device ko uske apne method se prove karo: laptops ke liye dot1x, printer ke liye mac-auth.</li>
<li>Printers ko IOT mein jaane ke liye status known aur Category=Printer chahiye.</li>
</ul></div>
`}};export{e as default};