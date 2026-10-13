var e={id:`show-commands`,h:{en:`The show commands that matter, and always-on tracing`,hi:`Zaroori show commands aur always-on tracing`},body:{en:`
<p>A mechanic starts with the dashboard lights and the diagnostic plug, not with a hammer. On the 9800 the dashboard is a small set of <b>show commands</b>. Learn them well and most tickets end before you need a trace. This chapter is a reading guide; chapter 4 then goes deeper with Radioactive Trace. The full 9800 toolset of wl-ops (chapter 3 there) is assumed; here we focus on what the <b>diagnostic</b> commands tell you.</p>

<h3>The inventory commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it proves</th><th>What to read</th></tr>
<tr><td><code>show ap summary</code></td><td>AP registered, name, model, IP</td><td>Missing AP means a join problem</td></tr>
<tr><td><code>show ap tag summary</code></td><td>Which tags an AP uses</td><td>Tag Source <code>Default</code> = nobody tagged it</td></tr>
<tr><td><code>show wlan summary</code></td><td>WLAN ID, profile, SSID, Status</td><td>Status UP or DOWN</td></tr>
<tr><td><code>show wireless tag policy detailed PT-CAMPUS</code></td><td>WLAN-to-policy maps</td><td>A WLAN missing from the list is not served</td></tr>
<tr><td><code>show wireless profile policy detailed PP-STAFF</code></td><td>VLAN, central switching, Status</td><td>DISABLED, wrong VLAN, central switching off</td></tr>
<tr><td><code>show vlan brief</code></td><td>VLAN database</td><td>Policy VLAN must be present</td></tr>
<tr><td><code>show aaa servers</code></td><td>RADIUS state and counters</td><td>Dead server, timeouts</td></tr>
<tr><td><code>show wireless client summary</code></td><td>Who is associated</td><td>State and IP per client</td></tr></table>

<h3>The diagnostic commands (this module)</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show ap join stats summary</code> and <code>show ap join stats detailed AP1</code></td><td>Why an AP is not joined, phase by phase</td></tr>
<tr><td><code>show wireless stats ap join summary</code> and <code>show wireless stats ap history</code></td><td>Join and drop events over time</td></tr>
<tr><td><code>show wireless client mac-address 0050.2fe9.9a01 detail</code></td><td>One client: state, AP, VLAN, IP, connection history</td></tr>
<tr><td><code>show wireless stats client delete reasons</code></td><td>Why clients were removed, counted by reason</td></tr>
<tr><td><code>show logging profile wireless ...</code></td><td>The Radioactive Trace output (chapter 4)</td></tr>
<tr><td><code>monitor capture ...</code></td><td>Embedded Packet Capture (chapter 6)</td></tr></table>

<div class="note"><p>The command <b>names</b> above are real. In the lab the table layouts and sentences of the join and delete-reason commands are model wording, as stated in chapter 1. Read the idea (phase, reason, count), not the exact columns.</p></div>

<h3>Reading one client in detail</h3>
<p>The client detail view is the single best "first look" at one device. Besides state, SSID, AP and VLAN, the lab adds a <b>Connection history</b> block: number of attempts, last failure reason, stage, 802.11 code and DHCP result.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.2fe9.9a01 detail
Client MAC Address                : 0050.2fe9.9a01
AP Name                           : AP1
WLAN Profile Name                 : NK-STAFF
Policy Profile                    : PP-STAFF
VLAN                              : 20
Client IP Address                 : <span class="hl">not learned</span>
Connection history (learning model)
  Attempts                        : 3
  Last failure stage              : <span class="hl">IP learning (DHCP)</span>
  DHCP result                     : no offer received</pre>
<p>Without a trace you already know the stage. The trace and capture then give the details.</p>

<h3>Delete reasons: the statistics view</h3>
<p>Every client the controller removes is counted by reason. A rising counter for one reason across many clients is a pattern, which one trace of one client cannot show.</p>
<pre class="out">WLC1# show wireless stats client delete reasons
Client delete reasons (counted by the learning model)
Reason                                                         Count
802.1X authentication timeout: no response from the RADIUS server [radius]   6
IP learn failed: no DHCP offer received [dhcp]                  2
<span class="hl">Total deleted clients: 8</span></pre>
<div class="eg"><p><b>Worked example.</b> Monday 09:00, helpdesk reports slow log-ins. The delete-reason table shows 40 clients removed with "802.1X authentication timeout" and none with "Access-Reject". Timeouts mean the RADIUS server did not answer; rejects would mean it answered no. You go straight to the AAA path (chapter 10) and skip the password-reset conversations.</p></div>

<h3>Always-on tracing</h3>
<p>The 9800 keeps <b>always-on</b> trace messages (note, warning and error level) for every client, even when nobody started a condition. This is a real feature: you can look backwards after a user complains. The command asks for the last hours and filters by MAC.</p>
<pre class="code">WLC1# show logging profile wireless start last 2 hours filter mac 0050.2fe9.9a01</pre>
<p>In the lab the model keeps note, warn and ERR lines always, and adds info and debug lines only inside a condition window. That matches the real idea: lower-level detail needs a condition, errors do not.</p>
<pre class="out">2026/10/04 17:12:57.457487 {wncd_x_R0-0}{1}: [client-orch-sm] [17765]: (ERR): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected</pre>

<div class="warn"><p><b>Common mistake.</b> Telling the user "reproduce it, I will turn on debug" when the always-on trace already holds the error. Look backwards first; it saves a second visit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Always-on tracing is about the controller process logs (note level and above). It is not a packet capture and it does not record every debug line unless a condition was active. Do not confuse the two.</p></div>

<div class="scn"><h4>The complaint from yesterday</h4><p>A director said her tablet failed to join on Friday afternoon. It was now Monday. The engineer ran <code>show logging profile wireless start last 3 days filter mac</code> for the tablet and found ERR lines saying the policy VLAN was missing at 15:20. The VLAN had been deleted by a clean-up script at 15:15. Nothing needed reproducing.</p><p><b>Lesson:</b> check the always-on trace before asking the user to try again.</p></div>

<div class="iv"><p class="q">"Which three show commands do you run before touching anything?"</p><p>Scope view (<code>show ap summary</code> and <code>show wireless client summary</code>), the client detail for the affected MAC, and the delete-reason statistics. Then I look at the always-on trace for that MAC. Only after that do I decide whether a live trace or capture is needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory commands show objects; diagnostic commands show behaviour over time.</li>
<li>The client detail view tells you the failing stage in one command.</li>
<li>Delete-reason counters expose patterns across many clients.</li>
<li>Always-on tracing lets you look backwards at note, warn and error lines.</li>
<li>Command names are real; the lab layouts and wording are model wording.</li>
</ul></div>
`,hi:`
<p>Mechanic dashboard ki lights aur diagnostic plug se shuru karta hai, hathode se nahi. 9800 par dashboard chhote se <b>show commands</b> ka set hai. Unhe achhe se seekho to zyada tickets trace ki zaroorat se pehle hi khatam ho jaate hain. Yeh chapter padhne ki guide hai; chapter 4 phir Radioactive Trace ke saath gehra jata hai. wl-ops ka poora 9800 toolset (wahan chapter 3) maan liya gaya hai; yahan hum <b>diagnostic</b> commands par focus karte hain.</p>

<h3>Inventory commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya prove karta hai</th><th>Kya padhna hai</th></tr>
<tr><td><code>show ap summary</code></td><td>AP registered, naam, model, IP</td><td>AP ka na hona matlab join problem</td></tr>
<tr><td><code>show ap tag summary</code></td><td>AP kaunse tags use karta hai</td><td>Tag Source <code>Default</code> = kisi ne tag nahi kiya</td></tr>
<tr><td><code>show wlan summary</code></td><td>WLAN ID, profile, SSID, Status</td><td>Status UP ya DOWN</td></tr>
<tr><td><code>show wireless tag policy detailed PT-CAMPUS</code></td><td>WLAN-to-policy maps</td><td>List mein na hone wala WLAN serve nahi hota</td></tr>
<tr><td><code>show wireless profile policy detailed PP-STAFF</code></td><td>VLAN, central switching, Status</td><td>DISABLED, galat VLAN, central switching off</td></tr>
<tr><td><code>show vlan brief</code></td><td>VLAN database</td><td>Policy VLAN maujood hona chahiye</td></tr>
<tr><td><code>show aaa servers</code></td><td>RADIUS state aur counters</td><td>Dead server, timeouts</td></tr>
<tr><td><code>show wireless client summary</code></td><td>Kaun associated hai</td><td>Har client ka state aur IP</td></tr></table>

<h3>Diagnostic commands (is module ke)</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show ap join stats summary</code> aur <code>show ap join stats detailed AP1</code></td><td>AP joined kyun nahi, phase-by-phase</td></tr>
<tr><td><code>show wireless stats ap join summary</code> aur <code>show wireless stats ap history</code></td><td>Waqt ke saath join aur drop events</td></tr>
<tr><td><code>show wireless client mac-address 0050.2fe9.9a01 detail</code></td><td>Ek client: state, AP, VLAN, IP, connection history</td></tr>
<tr><td><code>show wireless stats client delete reasons</code></td><td>Clients kyun hataye gaye, reason ke hisaab se count</td></tr>
<tr><td><code>show logging profile wireless ...</code></td><td>Radioactive Trace ka output (chapter 4)</td></tr>
<tr><td><code>monitor capture ...</code></td><td>Embedded Packet Capture (chapter 6)</td></tr></table>

<div class="note"><p>Upar ke command <b>naam</b> real hain. Lab mein join aur delete-reason commands ke table layouts aur sentences model wording hain, jaise chapter 1 mein bataya. Idea padho (phase, reason, count), exact columns nahi.</p></div>

<h3>Ek client ko detail mein padhna</h3>
<p>Client detail view ek device ka sabse achha "pehla look" hai. State, SSID, AP aur VLAN ke alawa lab ek <b>Connection history</b> block jodta hai: attempts ki ginti, last failure reason, stage, 802.11 code aur DHCP result.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.2fe9.9a01 detail
Client MAC Address                : 0050.2fe9.9a01
AP Name                           : AP1
WLAN Profile Name                 : NK-STAFF
Policy Profile                    : PP-STAFF
VLAN                              : 20
Client IP Address                 : <span class="hl">not learned</span>
Connection history (learning model)
  Attempts                        : 3
  Last failure stage              : <span class="hl">IP learning (DHCP)</span>
  DHCP result                     : no offer received</pre>
<p>Trace ke bina hi aapko stage pata hai. Trace aur capture phir details dete hain.</p>

<h3>Delete reasons: statistics view</h3>
<p>Controller jo bhi client hataata hai woh reason ke hisaab se ginta hai. Kai clients mein ek reason ka badhta counter ek pattern hai, jo ek client ka ek trace nahi dikha sakta.</p>
<pre class="out">WLC1# show wireless stats client delete reasons
Client delete reasons (counted by the learning model)
Reason                                                         Count
802.1X authentication timeout: no response from the RADIUS server [radius]   6
IP learn failed: no DHCP offer received [dhcp]                  2
<span class="hl">Total deleted clients: 8</span></pre>
<div class="eg"><p><b>Worked example.</b> Somvar 09:00, helpdesk slow log-in report karta hai. Delete-reason table 40 clients "802.1X authentication timeout" ke saath dikhata hai aur "Access-Reject" ek bhi nahi. Timeout ka matlab RADIUS server ne jawab nahi diya; reject ka matlab usne na kaha. Aap seedha AAA path (chapter 10) par jaate ho aur password-reset ki baatein skip karte ho.</p></div>

<h3>Always-on tracing</h3>
<p>9800 har client ke liye <b>always-on</b> trace messages (note, warning aur error level) rakhta hai, bhale kisi ne condition start na ki ho. Yeh real feature hai: user ke complaint ke baad aap peeche dekh sakte ho. Command pichhle ghante maangta hai aur MAC se filter karta hai.</p>
<pre class="code">WLC1# show logging profile wireless start last 2 hours filter mac 0050.2fe9.9a01</pre>
<p>Lab mein model note, warn aur ERR lines hamesha rakhta hai, aur info aur debug lines sirf condition window ke andar jodta hai. Yeh real idea se match karta hai: lower-level detail ke liye condition chahiye, errors ke liye nahi.</p>
<pre class="out">2026/10/04 17:12:57.457487 {wncd_x_R0-0}{1}: [client-orch-sm] [17765]: (ERR): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected</pre>

<div class="warn"><p><b>Common mistake.</b> User ko kehna "reproduce karo, main debug on karta hoon" jabki always-on trace mein error pehle se hai. Pehle peeche dekho; doosri visit bachti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Always-on tracing controller process logs ke baare mein hai (note level aur upar). Yeh packet capture nahi hai aur har debug line record nahi karta jab tak condition active na ho. Dono ko confuse mat karo.</p></div>

<div class="scn"><h4>Kal ki complaint</h4><p>Director ne kaha uska tablet Friday dopahar join nahi hua. Ab Monday tha. Engineer ne tablet ke liye <code>show logging profile wireless start last 3 days filter mac</code> chalaya aur 15:20 par ERR lines mili ki policy VLAN missing tha. VLAN ek clean-up script ne 15:15 par delete kiya tha. Kuch reproduce karne ki zaroorat nahi padi.</p><p><b>Lesson:</b> user se dubara try karwane se pehle always-on trace check karo.</p></div>

<div class="iv"><p class="q">"Kuch chhoone se pehle aap kaunse teen show commands chalate ho?"</p><p>Scope view (<code>show ap summary</code> aur <code>show wireless client summary</code>), affected MAC ka client detail, aur delete-reason statistics. Phir us MAC ka always-on trace dekhta hoon. Uske baad hi decide karta hoon ki live trace ya capture chahiye ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory commands objects dikhate hain; diagnostic commands waqt ke saath behaviour.</li>
<li>Client detail view ek command mein failing stage batata hai.</li>
<li>Delete-reason counters kai clients ka pattern dikhate hain.</li>
<li>Always-on tracing se note, warn aur error lines peeche jaakar dekh sakte ho.</li>
<li>Command naam real hain; lab ke layouts aur wording model wording hain.</li>
</ul></div>
`}};export{e as default};