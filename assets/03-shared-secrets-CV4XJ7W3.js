var e={id:`shared-secrets`,h:{en:`Shared secrets: the password between two devices`,hi:`Shared secrets: do devices ke beech ka password`},body:{en:`
<p>Two friends agree on a code word. When one phones the other, the code word proves it is really them. If the code words differ by even one letter, the call-taker concludes "wrong person" and hangs up without a word. A <b>RADIUS shared secret</b> works the same way. It is a string configured on both the NAD and the server. It is never sent over the wire; it is used to compute a checksum that proves the packet came from someone who knows it.</p>

<h3>What the secret really does</h3>
<p>RADIUS runs over UDP: authentication on port 1812 and accounting on 1813 (older installations may still use 1645 and 1646). The secret has three jobs:</p>
<ol>
<li><b>Authenticate the packet.</b> Access-Request packets carry a Request Authenticator, a random value. The server mixes the secret into its reply (the Response Authenticator), so the NAD can check that the reply is genuine. Packets that contain the Message-Authenticator attribute are also signed with the secret.</li>
<li><b>Hide the user password.</b> With PAP, the password attribute is obscured using the secret and the Request Authenticator. (Inside PEAP the real credentials are protected by the TLS tunnel, which is much stronger; chapter 8.)</li>
<li><b>Tie the two ends together.</b> With the wrong secret, the server cannot verify the packet, and the NAD cannot verify the reply.</li>
</ol>
<p>The secret is <b>not</b> a user password and it is <b>not</b> related to the 802.1X credentials. Never reuse a user or admin password as a secret.</p>

<h3>The ClearPass behaviour you must remember</h3>
<p>The secret is checked <b>per network device</b>. ClearPass first finds the device by source IP (chapter 2), then verifies the packet with that device's configured RADIUS secret. If the check fails the request is <b>silently dropped</b>: no Access-Reject, no error to the switch. ClearPass writes a system event to the Event Viewer and does not create a normal Access Tracker record. The switch waits for its timeout, retries, then marks the server as dead or unreachable.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Secret match versus mismatch">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch key A</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">NAD secret A</text>
<line x1="150" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Access-Request</text>
<text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">verified, policy runs</text>
<rect x="20" y="120" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="13">Switch key A</text>
<rect x="490" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="13">NAD secret B</text>
<line x1="150" y1="145" x2="440" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Access-Request</text>
<text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">dropped, no reply, Event Viewer entry</text>
<text x="465" y="150" class="svg-ink" font-size="18">X</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">The switch only sees a timeout and marks the server dead</text>
</svg><p class="cap">Top: matching secrets. Bottom: a mismatch is silence, not an error message.</p></div>

<h3>Evidence on both sides</h3>
<p>Because the symptom looks the same as an unreachable server, you need evidence from both ends. First the switch:</p>
<pre class="out">ACCESS# show radius-server
Server: 10.20.60.10   Port: 1812   VRF: default
  Status           : <span class="hl">unreachable</span>
  Requests sent    : 12
  Timeouts         : 12
  Accepts          : 0
  Rejects          : 0</pre>
<p>Timeouts rising while accepts and rejects stay at zero means: no reply at all. A server that was <i>rejecting</i> would show rejects. Then ClearPass:</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time       Source   Level  Description
10:52:31   RADIUS   ERROR  <span class="hl">Shared secret mismatch for network device ACCESS (10.20.99.2); request dropped</span></pre>
<p>These outputs are representative. Wording in a real release is different (for example a message about an invalid Message-Authenticator or a failed authenticator check), but the lesson is the same: the device is known, the packet failed verification.</p>
<p>Notice how the two clues combine. If the Event Viewer says <i>unknown device</i>, the problem is the address (chapter 4). If it says the device is known but the secret failed, the problem is the key.</p>

<h3>Repair: which side is right?</h3>
<p>Never guess. The company has an approved secret (usually from a change record or a secrets vault), and the other side is changed to match. In the lab <code>cp-secret-mismatch</code> the key on the switch is the approved one, so the fix is on ClearPass: edit the network device and enter the same secret. No policy change is needed.</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Network &gt; Devices &gt; ACCESS &gt; RADIUS Shared Secret</span>
<span class="c">! Lab shell on CPPM:</span>
configuration network device ACCESS secret ArubaNK1
<span class="c">! Lab shell on ACCESS: confirm recovery</span>
show radius-server</pre>
<p>Afterwards force the client to try again (the lab retries after the quiet period, or bounce the port) and prove that LAPTOP1 is authorized as EMPLOYEE in VLAN 10.</p>

<div class="eg"><p><b>Worked example.</b> The approved key is ArubaNK1. The engineer typed <code>ArubaNK1 </code> with a trailing space on the switch, or typed a lowercase l instead of the digit 1 on ClearPass. Both look identical on a quick glance. The proper habit: retype the secret on the side you are repairing instead of comparing by eye, and avoid copying from chat tools that add invisible characters.</p></div>

<h3>Good secret hygiene</h3>
<ul>
<li>Use a long random value (the product allows long secrets; 16 characters or more is a common baseline).</li>
<li>Use a different secret per device or per site, so one leaked config does not expose the whole network.</li>
<li>On the switch, the key is stored encrypted in the saved configuration, but displayed plain in some commands; do not paste configurations into tickets.</li>
<li>When rotating, plan the order: change ClearPass and the switch close together, because in between, authentication fails. Many sites do it in a maintenance window.</li>
<li>CoA uses the same idea: the switch&#39;s dyn-authorization client entry needs the shared secret that ClearPass uses for that device.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Reading a dead RADIUS server as a network problem and asking for firewall changes. If ping to 10.20.60.10 works and the Event Viewer shows a secret failure, the network is fine. Equally, do not change the policy: policy objects are never evaluated for a packet that failed verification.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A secret mismatch makes ClearPass send Access-Reject." No. It drops the request. Another trap: the secret is configured per network device on ClearPass, not once for the whole server.</p></div>

<div class="scn"><h4>Rotated on one side only</h4><p>A security audit required new RADIUS secrets. The network team changed the key on 20 switches overnight; the NAC team planned to update ClearPass in the morning. At 07:30 nobody could connect. Switches showed the server unreachable. The Event Viewer was full of verification failures. Updating the network device entries fixed it, and the team added a runbook step: update both ends in one window with a rollback value ready.</p><p><b>Lesson:</b> a secret change is a two-sided change; plan it as one task.</p></div>

<div class="iv"><p class="q">"The switch says RADIUS unreachable but ping works. What do you check?"</p><p>Strong answer: ping only proves IP reachability; RADIUS is UDP and can be dropped for trust reasons. I check the ClearPass Event Viewer for an unknown device or a secret failure, compare the NAD address and secret with the switch configuration, and read the switch counters (timeouts rising, no rejects). I fix the side that disagrees with the approved value and test with a fresh authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The RADIUS shared secret authenticates packets between NAD and server; it is not sent on the wire and is not a user password.</li>
<li>ClearPass checks the secret per network device after finding the device by source IP.</li>
<li>A mismatch means silent drop: switch timeouts, no rejects, an Event Viewer entry on ClearPass.</li>
<li>Repair the side that differs from the approved value; retype instead of comparing by eye.</li>
<li>Change secrets on both ends in one window; use unique, long secrets.</li>
</ul></div>
`,hi:`
<p>Do dost ek code word tay karte hain. Jab ek doosre ko phone karta hai, code word prove karta hai ki yeh sach mein wahi hai. Agar code words mein ek akshar ka bhi farak ho, to call lene wala sochta hai "galat insaan" aur bina kuch bole phone rakh deta hai. <b>RADIUS shared secret</b> bilkul aise hi kaam karta hai. Yeh ek string hai jo NAD aur server dono par configure hoti hai. Yeh kabhi wire par nahi bheji jaati; isse ek checksum nikalta hai jo prove karta hai ki packet usi se aaya jo secret jaanta hai.</p>

<h3>Secret asal mein kya karta hai</h3>
<p>RADIUS UDP par chalta hai: authentication port 1812 par aur accounting 1813 par (purani installations abhi bhi 1645 aur 1646 use kar sakti hain). Secret ke teen kaam hain:</p>
<ol>
<li><b>Packet ko authenticate karna.</b> Access-Request packets mein Request Authenticator hota hai, ek random value. Server apne reply (Response Authenticator) mein secret mix karta hai, taaki NAD check kar sake ki reply asli hai. Jin packets mein Message-Authenticator attribute hota hai woh bhi secret se signed hote hain.</li>
<li><b>User password chhupana.</b> PAP mein password attribute secret aur Request Authenticator se obscure hota hai. (PEAP ke andar asli credentials TLS tunnel se protected hote hain, jo bahut strong hai; chapter 8.)</li>
<li><b>Dono ends ko jodna.</b> Galat secret ke saath server packet verify nahi kar sakta, aur NAD reply verify nahi kar sakta.</li>
</ol>
<p>Secret user password <b>nahi</b> hai aur 802.1X credentials se <b>related nahi</b> hai. Kisi user ya admin password ko secret ki tarah kabhi reuse mat karo.</p>

<h3>ClearPass ka behaviour jo yaad rakhna hai</h3>
<p>Secret <b>per network device</b> check hota hai. ClearPass pehle source IP se device dhoondta hai (chapter 2), phir us device ke configured RADIUS secret se packet verify karta hai. Agar check fail ho to request <b>chupchaap drop</b> ho jaati hai: koi Access-Reject nahi, switch ko koi error nahi. ClearPass Event Viewer mein system event likhta hai aur normal Access Tracker record nahi banata. Switch apne timeout tak intezaar karta hai, retry karta hai, phir server ko dead ya unreachable mark kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Secret match aur mismatch">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Switch key A</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">NAD secret A</text>
<line x1="150" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">Access-Request</text>
<text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">verify hua, policy chalti hai</text>
<rect x="20" y="120" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="150" text-anchor="middle" class="svg-ink" font-size="13">Switch key A</text>
<rect x="490" y="120" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="13">NAD secret B</text>
<line x1="150" y1="145" x2="440" y2="145" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="12">Access-Request</text>
<text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">drop, koi reply nahi, Event Viewer entry</text>
<text x="465" y="150" class="svg-ink" font-size="18">X</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Switch ko sirf timeout dikhta hai aur server dead mark hota hai</text>
</svg><p class="cap">Upar: secrets match. Neeche: mismatch khamoshi hai, error message nahi.</p></div>

<h3>Dono sides par evidence</h3>
<p>Kyunki symptom unreachable server jaisa dikhta hai, aapko dono ends se evidence chahiye. Pehle switch:</p>
<pre class="out">ACCESS# show radius-server
Server: 10.20.60.10   Port: 1812   VRF: default
  Status           : <span class="hl">unreachable</span>
  Requests sent    : 12
  Timeouts         : 12
  Accepts          : 0
  Rejects          : 0</pre>
<p>Timeouts badh rahe hain jabki accepts aur rejects zero hain: matlab koi reply hi nahi. Jo server <i>reject</i> karta, woh rejects dikhata. Phir ClearPass:</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time       Source   Level  Description
10:52:31   RADIUS   ERROR  <span class="hl">Shared secret mismatch for network device ACCESS (10.20.99.2); request dropped</span></pre>
<p>Yeh outputs representative hain. Real release mein wording alag hoti hai (jaise invalid Message-Authenticator ya failed authenticator check ka message), par seekh wahi hai: device known hai, packet verification mein fail hua.</p>
<p>Dono clues kaise jud-te hain, dekho. Agar Event Viewer <i>unknown device</i> kahe, to problem address ki hai (chapter 4). Agar kahe ki device known hai par secret fail hua, to problem key ki hai.</p>

<h3>Repair: kaunsi side sahi hai?</h3>
<p>Kabhi andaza mat lagao. Company ke paas approved secret hota hai (aam taur par change record ya secrets vault mein), aur doosri side use match karne ke liye badli jaati hai. Lab <code>cp-secret-mismatch</code> mein switch ki key approved hai, isliye fix ClearPass par hai: network device edit karo aur same secret daalo. Policy change ki zaroorat nahi.</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Network &gt; Devices &gt; ACCESS &gt; RADIUS Shared Secret</span>
<span class="c">! Lab shell on CPPM:</span>
configuration network device ACCESS secret ArubaNK1
<span class="c">! Lab shell on ACCESS: recovery confirm karo</span>
show radius-server</pre>
<p>Uske baad client ko dobara try karwao (lab quiet period ke baad retry karta hai, ya port bounce karo) aur prove karo ki LAPTOP1 VLAN 10 mein EMPLOYEE ki tarah authorized hai.</p>

<div class="eg"><p><b>Worked example.</b> Approved key ArubaNK1 hai. Engineer ne switch par <code>ArubaNK1 </code> trailing space ke saath type kiya, ya ClearPass par digit 1 ki jagah chhota l type kiya. Dono jaldi nazar mein ek jaise dikhte hain. Sahi aadat: jis side ko repair kar rahe ho wahan secret dobara type karo, aankh se compare mat karo, aur chat tools se copy karne se bacho jo invisible characters jod dete hain.</p></div>

<h3>Achhi secret hygiene</h3>
<ul>
<li>Lambi random value use karo (product lambe secrets allow karta hai; 16 ya zyada characters common baseline hai).</li>
<li>Har device ya har site ka alag secret rakho, taaki ek leaked config poore network ko expose na kare.</li>
<li>Switch par key saved configuration mein encrypted store hoti hai, par kuch commands mein plain dikhti hai; configurations tickets mein paste mat karo.</li>
<li>Rotate karte waqt order plan karo: ClearPass aur switch ek doosre ke kareeb badlo, kyunki beech mein authentication fail hota hai. Bahut sites maintenance window mein karti hain.</li>
<li>CoA mein bhi yahi idea hai: switch ki dyn-authorization client entry ko wahi shared secret chahiye jo ClearPass us device ke liye use karta hai.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Dead RADIUS server ko network problem samajhkar firewall changes maangna. Agar 10.20.60.10 ka ping chalta hai aur Event Viewer secret failure dikhata hai, to network theek hai. Isi tarah policy mat badlo: jo packet verification mein fail hua uske liye policy objects kabhi evaluate hi nahi hote.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Secret mismatch par ClearPass Access-Reject bhejta hai." Nahi. Woh request drop karta hai. Ek aur trap: secret ClearPass par per network device configure hota hai, poore server ke liye ek baar nahi.</p></div>

<div class="scn"><h4>Sirf ek side par rotate hua</h4><p>Ek security audit ne naye RADIUS secrets maange. Network team ne raat mein 20 switches par key badal di; NAC team ne subah ClearPass update karne ka plan banaya tha. Subah 07:30 par koi connect nahi ho paaya. Switches server ko unreachable dikha rahe the. Event Viewer verification failures se bhara tha. Network device entries update karne se sab theek hua, aur team ne runbook mein step joda: dono ends ek window mein update karo, rollback value taiyaar rakho.</p><p><b>Seekh:</b> secret change do-sided change hai; ise ek task ki tarah plan karo.</p></div>

<div class="iv"><p class="q">"Switch RADIUS unreachable bata raha hai par ping chalta hai. Aap kya check karoge?"</p><p>Strong answer: ping sirf IP reachability prove karta hai; RADIUS UDP hai aur trust ki wajah se drop ho sakta hai. Main ClearPass Event Viewer mein unknown device ya secret failure dekhta hoon, NAD address aur secret ko switch configuration se compare karta hoon, aur switch counters padhta hoon (timeouts badh rahe, rejects nahi). Jo side approved value se alag hai use fix karta hoon aur fresh authentication se test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS shared secret NAD aur server ke beech packets ko authenticate karta hai; wire par nahi jaata aur user password nahi hai.</li>
<li>ClearPass source IP se device dhoondhne ke baad secret per network device check karta hai.</li>
<li>Mismatch matlab silent drop: switch timeouts, rejects nahi, ClearPass par Event Viewer entry.</li>
<li>Jo side approved value se alag hai use repair karo; aankh se compare karne ki jagah dobara type karo.</li>
<li>Secrets dono ends par ek window mein badlo; unique aur lambe secrets use karo.</li>
</ul></div>
`}};export{e as default};