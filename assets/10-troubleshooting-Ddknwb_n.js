var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: read the state, the log and the policy`,hi:`Troubleshooting workflow: state, log aur policy padho`},body:{en:`
<p>A doctor does not start with surgery. She reads the chart, asks where it hurts and runs one test at a time. Security troubleshooting is the same: <b>evidence first, then one change, then proof</b>. Wireless security problems look similar to the user ("it will not work") but each has a different signature in the client state, the controller log or the policy. This chapter gives you a three-step reading routine and walks the four troubleshoot-style tickets of the labs, plus the AAA override build.</p>

<h3>The routine: state, log, policy</h3>
<ol>
<li><b>State.</b> Where is the client? <code>show wireless client summary</code> and <code>show wireless client mac-address &lt;mac&gt; detail</code> give the client state (<code>WEBAUTH_REQUIRED</code>, <code>Run</code>), the VLAN, the PMF mode, the IPv4 ACL. On the client, <code>wifi status</code>.</li>
<li><b>Log.</b> Why was it refused or held? <code>show logging</code> contains the specific message: status code 31 or 43, MAB failure reason, RADIUS timeout, client excluded.</li>
<li><b>Policy.</b> What does the controller think it should do? <code>show wlan name</code>, <code>show wireless profile policy detailed &lt;name&gt;</code>, <code>show aaa method-lists</code>, <code>show ip access-lists</code>, <code>show parameter-map type webauth all</code>.</li>
</ol>
<p>Web UI equivalents: <b>Monitoring &gt; Wireless &gt; Clients</b>, <b>Troubleshooting &gt; Logs</b>, then the configuration pages in <b>Configuration &gt; Security</b> and <b>Configuration &gt; Tags &amp; Profiles</b>. The client state detail and the sign-in are CLI in this build.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Security troubleshooting decision tree">
<rect x="230" y="10" width="180" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client cannot get access</text>
<rect x="20" y="75" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="12">Associated, has IP,</text><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="12">WEBAUTH_REQUIRED</text>
<rect x="235" y="75" width="170" height="44" rx="8" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">Rejected at association,</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">log shows a status code</text>
<rect x="450" y="75" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="12">In RUN, wrong reach</text><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="12">or wrong VLAN</text>
<line x1="280" y1="44" x2="105" y2="75" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="75" stroke="#64748b"/><line x1="360" y1="44" x2="535" y2="75" stroke="#64748b"/>
<rect x="20" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="11">Web server on? map exists?</text><text x="105" y="187" text-anchor="middle" class="svg-ink" font-size="11">list name match? AAA on?</text><text x="105" y="204" text-anchor="middle" class="svg-ink" font-size="11">user in the list?</text>
<rect x="235" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="11">31: PMF vs client</text><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="11">43: AKM (SAE) vs client</text><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="11">excluded? MAB reason?</text>
<rect x="450" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="11">ACL order and applied?</text><text x="535" y="187" text-anchor="middle" class="svg-ink" font-size="11">aaa-override on?</text><text x="535" y="204" text-anchor="middle" class="svg-ink" font-size="11">VLAN exists? policy tag?</text>
<line x1="105" y1="119" x2="105" y2="150" stroke="#64748b"/><line x1="320" y1="119" x2="320" y2="150" stroke="#64748b"/><line x1="535" y1="119" x2="535" y2="150" stroke="#64748b"/>
</svg><p class="cap">Three client symptoms lead to three short checklists.</p></div>

<h3>Ticket 1: guest stuck in WEBAUTH_REQUIRED (lab: wl-secure-webauth-stuck)</h3>
<p>Symptom: PHONE1 has an address on NK-GUEST but the login never succeeds. State confirms the radio side works. Evidence:</p>
<pre class="out">WLC1# show wlan name NK-GUEST
...
  Web Auth: enabled   Authentication list: <span class="hl">GUEST-LIST</span>   Parameter map: <span class="hl">PM-GUEST</span>

WLC1# show aaa method-lists authentication
Authentication method lists:
  <span class="hl">GUEST-LOGIN</span>   local

PHONE1&gt; wifi webauth user guest1 password Guest@123
No login page is served: the controller web server is disabled (ip h&#116;tp server / ip h&#116;tp secure-server).
The client stays in WEBAUTH_REQUIRED.</pre>
<p>Three defects, found in the order the sign-in checks them: the web server is off, the parameter map PM-GUEST does not exist, and the login list is named GUEST-LOGIN while the WLAN uses GUEST-LIST. Fix each where it lives: <code>ip h&#116;tp server</code>; <code>parameter-map type webauth PM-GUEST</code> with <code>type webauth</code>; <code>aaa authentication login GUEST-LIST local</code>. Re-test after each fix; after the last, the client reaches RUN and pings 10.10.50.1.</p>

<h3>Ticket 2: guest ACL leaking (lab: wl-secure-guest-acl-leak)</h3>
<p>Symptom: a guest pings 10.10.60.20 and 10.10.40.1. Evidence is the ACL with counters and the policy profile: a <code>permit ip any any</code> at sequence 10 and <code>IPv4 ACL : (not set)</code>. Fix in two parts: re-order the ACL (<code>no 10</code>, <code>40 permit ip any any</code>) and apply it (<code>shutdown</code>, <code>ipv4 acl GUEST-ACL</code>, <code>no shutdown</code> on PP-GUEST). Prove with three pings: gateway 10.10.50.1 works, 10.10.60.20 and 10.10.40.1 fail, and the deny lines show hits.</p>
<pre class="out">WLC1# show ip access-lists GUEST-ACL
Extended IP access list GUEST-ACL
    20 deny ip any 10.10.60.0 0.0.0.255 (3 matches)
    30 deny ip any 10.10.40.0 0.0.0.255 (3 matches)
    40 permit ip any any (9 matches)</pre>

<h3>Ticket 3: PMF mandatory locks out a client (lab: wl-secure-pmf-mismatch)</h3>
<p>Symptom: LAPTOP1 joins NK-SECURE, SCANNER1 does not. The log states the reason in one line.</p>
<pre class="out">WLC1# show logging
<span class="hl">%APF-4-ASSOC_REJECT: Client 0050.7966.6808 rejected on WLAN 4 (NK-SECURE): PMF is required, client is not PMF capable (status 31)</span>
SCANNER1&gt; wifi caps
PMF: none    SAE: off</pre>
<p>The client cannot change, so the policy must: <code>wlan NK-SECURE</code>, <code>shutdown</code>, <code>security pmf optional</code>, <code>no shutdown</code>. Keep WPA2/WPA3 transition on, then retry both joins. Both clients are in VLAN 20 and reach 10.10.60.20. Remember to retry SCANNER1 so the original rejection stays visible in the log for the record.</p>

<h3>Build lab: AAA override (lab: wl-secure-aaa-override)</h3>
<p>Symptom: alice should be in VLAN 40 but lands in VLAN 20. Read both sides: RAD1 policy says <code>alice vlan 40</code>; the policy profile has no override line. Fix: <code>aaa-override</code> on PP-CORP (shut down first), reconnect LAPTOP1. Proof is the VLAN line in the client detail and an address in 10.10.40.0/24.</p>

<h3>Ticket 4 and 5: other signatures you must recognise</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>First check</th></tr>
<tr><td>Client rejected, "excluded"</td><td>Repeated failures hit the exclusion rule</td><td><code>show wireless exclusionlist</code>, then fix the cause and <code>clear wireless exclusionlist</code></td></tr>
<tr><td>MAB device rejected</td><td>MAC not listed, server down, wrong secret, randomized MAC</td><td>Log reason, then the list, then the device setting</td></tr>
<tr><td>RADIUS returned VLAN ignored</td><td>No <code>aaa-override</code>, or VLAN missing on controller</td><td>Policy detail and the VLAN database</td></tr>
<tr><td>SAE-only WLAN, one client refused (43)</td><td>Client has no SAE</td><td>Client capability, then transition mode</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A ticket says "guest Wi-Fi is broken". Reading state: client has IP, WEBAUTH_REQUIRED. Reading log: nothing new. Reading policy: the parameter map list is empty. One defect, one fix: create PM-GUEST. Elapsed time: four minutes, no reload, no guessing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once, so you do not know which fixed it. Editing an enabled WLAN or policy profile and wondering why the command is refused. Fixing the client when the policy is the defect. Declaring victory without a proof test from the client.</p></div>

<div class="exam"><p><b>Exam traps.</b> Status 31 is PMF, status 43 is AKM. A missing ACL permits traffic. WEBAUTH_REQUIRED is not a radio failure. The returned RADIUS VLAN does nothing without aaa-override.</p></div>

<div class="scn"><h4>Friday patch, Monday tickets</h4><p>A Friday hardening patch set PMF to mandatory and renamed the guest login list in a script. On Monday the helpdesk had two kinds of tickets: scanners that could not join and guests that could not sign in. The engineer split them by state: scanners were rejected at association (log: status 31), guests were in WEBAUTH_REQUIRED (list name mismatch). Two small fixes, each proven from the client, closed forty tickets.</p><p><b>Lesson:</b> classify the symptom by state first, then the log tells you the exact defect.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a wireless client that cannot get access."</p><p>State: where is the client (rejected, associated, held, running)? Log: what reason did the controller record? Policy: compare the configured objects with that reason, fix one thing, and prove it from the client. Mention that you read before you change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, log, policy, one change, proof from the client.</li>
<li>WEBAUTH_REQUIRED means radio is fine: check web server, map, list, AAA.</li>
<li>Leaking ACL: look at order, then at where it is applied.</li>
<li>Status 31 and 43 point to PMF and AKM mismatches; fix policy or client capability.</li>
<li>Edit WLANs and policy profiles only while shut down.</li>
</ul></div>
`,hi:`
<p>Doctor operation se shuru nahi karti. Woh chart padhti hai, poochti hai kahan dard hai, aur ek ek test chalati hai. Security troubleshooting bhi aisi hi hai: <b>pehle evidence, phir ek change, phir proof</b>. Wireless security problems user ko ek jaisi lagti hain ("chal nahi raha") lekin har ek ki client state, controller log ya policy mein alag signature hoti hai. Yeh chapter aapko teen-step padhne ka routine deta hai aur labs ke chaar troubleshoot-style tickets plus AAA override build ko walk karta hai.</p>

<h3>Routine: state, log, policy</h3>
<ol>
<li><b>State.</b> Client kahan hai? <code>show wireless client summary</code> aur <code>show wireless client mac-address &lt;mac&gt; detail</code> client state (<code>WEBAUTH_REQUIRED</code>, <code>Run</code>), VLAN, PMF mode, IPv4 ACL dete hain. Client par <code>wifi status</code>.</li>
<li><b>Log.</b> Use refuse ya hold kyun kiya gaya? <code>show logging</code> mein specific message hota hai: status code 31 ya 43, MAB failure reason, RADIUS timeout, client excluded.</li>
<li><b>Policy.</b> Controller ko lagta hai use kya karna chahiye? <code>show wlan name</code>, <code>show wireless profile policy detailed &lt;name&gt;</code>, <code>show aaa method-lists</code>, <code>show ip access-lists</code>, <code>show parameter-map type webauth all</code>.</li>
</ol>
<p>Web UI equivalents: <b>Monitoring &gt; Wireless &gt; Clients</b>, <b>Troubleshooting &gt; Logs</b>, phir <b>Configuration &gt; Security</b> aur <b>Configuration &gt; Tags &amp; Profiles</b> ke configuration pages. Client state detail aur sign-in is build mein CLI hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Security troubleshooting decision tree">
<rect x="230" y="10" width="180" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client ko access nahi mil raha</text>
<rect x="20" y="75" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="94" text-anchor="middle" class="svg-ink" font-size="12">Associated, IP hai,</text><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="12">WEBAUTH_REQUIRED</text>
<rect x="235" y="75" width="170" height="44" rx="8" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">Association par reject,</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">log mein status code</text>
<rect x="450" y="75" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="94" text-anchor="middle" class="svg-ink" font-size="12">RUN mein, galat reach</text><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="12">ya galat VLAN</text>
<line x1="280" y1="44" x2="105" y2="75" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="75" stroke="#64748b"/><line x1="360" y1="44" x2="535" y2="75" stroke="#64748b"/>
<rect x="20" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="11">Web server on? map hai?</text><text x="105" y="187" text-anchor="middle" class="svg-ink" font-size="11">list name match? AAA on?</text><text x="105" y="204" text-anchor="middle" class="svg-ink" font-size="11">user list mein hai?</text>
<rect x="235" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="11">31: PMF vs client</text><text x="320" y="187" text-anchor="middle" class="svg-ink" font-size="11">43: AKM (SAE) vs client</text><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="11">excluded? MAB reason?</text>
<rect x="450" y="150" width="170" height="70" rx="8" fill="#e2e8f0"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="11">ACL order aur applied?</text><text x="535" y="187" text-anchor="middle" class="svg-ink" font-size="11">aaa-override on?</text><text x="535" y="204" text-anchor="middle" class="svg-ink" font-size="11">VLAN exist? policy tag?</text>
<line x1="105" y1="119" x2="105" y2="150" stroke="#64748b"/><line x1="320" y1="119" x2="320" y2="150" stroke="#64748b"/><line x1="535" y1="119" x2="535" y2="150" stroke="#64748b"/>
</svg><p class="cap">Teen client symptoms teen chhoti checklists tak le jaate hain.</p></div>

<h3>Ticket 1: guest WEBAUTH_REQUIRED mein atka (lab: wl-secure-webauth-stuck)</h3>
<p>Symptom: PHONE1 ko NK-GUEST par address hai lekin login kabhi succeed nahi hota. State confirm karti hai ki radio side kaam karti hai. Evidence:</p>
<pre class="out">WLC1# show wlan name NK-GUEST
...
  Web Auth: enabled   Authentication list: <span class="hl">GUEST-LIST</span>   Parameter map: <span class="hl">PM-GUEST</span>

WLC1# show aaa method-lists authentication
Authentication method lists:
  <span class="hl">GUEST-LOGIN</span>   local

PHONE1&gt; wifi webauth user guest1 password Guest@123
No login page is served: the controller web server is disabled (ip h&#116;tp server / ip h&#116;tp secure-server).
The client stays in WEBAUTH_REQUIRED.</pre>
<p>Teen defects, us order mein mile jis order mein sign-in check karta hai: web server off hai, parameter map PM-GUEST exist nahi karta, aur login list ka naam GUEST-LOGIN hai jabki WLAN GUEST-LIST use karta hai. Har ek ko wahin fix karo jahan woh rehta hai: <code>ip h&#116;tp server</code>; <code>type webauth</code> ke saath <code>parameter-map type webauth PM-GUEST</code>; <code>aaa authentication login GUEST-LIST local</code>. Har fix ke baad re-test karo; aakhri ke baad client RUN mein pahunchta hai aur 10.10.50.1 ping karta hai.</p>

<h3>Ticket 2: guest ACL leak kar raha hai (lab: wl-secure-guest-acl-leak)</h3>
<p>Symptom: guest 10.10.60.20 aur 10.10.40.1 ping karta hai. Evidence counters ke saath ACL aur policy profile hain: sequence 10 par <code>permit ip any any</code> aur <code>IPv4 ACL : (not set)</code>. Fix do hisson mein: ACL re-order karo (<code>no 10</code>, <code>40 permit ip any any</code>) aur apply karo (PP-GUEST par <code>shutdown</code>, <code>ipv4 acl GUEST-ACL</code>, <code>no shutdown</code>). Teen pings se prove karo: gateway 10.10.50.1 chalta hai, 10.10.60.20 aur 10.10.40.1 fail hote hain, aur deny lines par hits dikhte hain.</p>
<pre class="out">WLC1# show ip access-lists GUEST-ACL
Extended IP access list GUEST-ACL
    20 deny ip any 10.10.60.0 0.0.0.255 (3 matches)
    30 deny ip any 10.10.40.0 0.0.0.255 (3 matches)
    40 permit ip any any (9 matches)</pre>

<h3>Ticket 3: PMF mandatory client ko bahar kar deta hai (lab: wl-secure-pmf-mismatch)</h3>
<p>Symptom: LAPTOP1 NK-SECURE join karta hai, SCANNER1 nahi. Log ek line mein wajah batata hai.</p>
<pre class="out">WLC1# show logging
<span class="hl">%APF-4-ASSOC_REJECT: Client 0050.7966.6808 rejected on WLAN 4 (NK-SECURE): PMF is required, client is not PMF capable (status 31)</span>
SCANNER1&gt; wifi caps
PMF: none    SAE: off</pre>
<p>Client badal nahi sakta, isliye policy badlegi: <code>wlan NK-SECURE</code>, <code>shutdown</code>, <code>security pmf optional</code>, <code>no shutdown</code>. WPA2/WPA3 transition on rakho, phir dono joins retry karo. Dono clients VLAN 20 mein hain aur 10.10.60.20 tak pahunchte hain. SCANNER1 ko retry karna yaad rakho taaki original rejection record ke liye log mein dikhta rahe.</p>

<h3>Build lab: AAA override (lab: wl-secure-aaa-override)</h3>
<p>Symptom: alice ko VLAN 40 mein hona chahiye lekin woh VLAN 20 mein land karti hai. Dono taraf padho: RAD1 policy kehti hai <code>alice vlan 40</code>; policy profile mein override line nahi hai. Fix: PP-CORP par <code>aaa-override</code> (pehle shut down), LAPTOP1 reconnect karo. Proof client detail mein VLAN line aur 10.10.40.0/24 mein address hai.</p>

<h3>Ticket 4 aur 5: doosri signatures jo aapko pehchaanni hain</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Pehla check</th></tr>
<tr><td>Client reject, "excluded"</td><td>Repeated failures ne exclusion rule hit kiya</td><td><code>show wireless exclusionlist</code>, phir wajah fix karo aur <code>clear wireless exclusionlist</code></td></tr>
<tr><td>MAB device reject</td><td>MAC listed nahi, server down, galat secret, randomized MAC</td><td>Log reason, phir list, phir device setting</td></tr>
<tr><td>RADIUS ka bheja VLAN ignore</td><td><code>aaa-override</code> nahi, ya controller par VLAN missing</td><td>Policy detail aur VLAN database</td></tr>
<tr><td>SAE-only WLAN, ek client refuse (43)</td><td>Client mein SAE nahi</td><td>Client capability, phir transition mode</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ticket kehta hai "guest Wi-Fi kharab hai". State padhi: client ko IP hai, WEBAUTH_REQUIRED. Log padha: kuch naya nahi. Policy padhi: parameter map list khaali hai. Ek defect, ek fix: PM-GUEST banao. Time: chaar minute, na reload, na andaaza.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Teen cheezein ek saath badalna, to pata nahi kisne fix kiya. Enabled WLAN ya policy profile edit karke sochna ki command refuse kyun hua. Policy defect hote hue client fix karna. Client se proof test ke bina jeet ghoshit kar dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Status 31 PMF hai, status 43 AKM hai. Missing ACL traffic permit karta hai. WEBAUTH_REQUIRED radio failure nahi hai. RADIUS ka returned VLAN aaa-override ke bina kuch nahi karta.</p></div>

<div class="scn"><h4>Friday patch, Monday tickets</h4><p>Friday ke hardening patch ne PMF ko mandatory kiya aur ek script mein guest login list ka naam badal diya. Monday ko helpdesk ke paas do tarah ke tickets the: scanners jo join nahi ho pa rahe aur guests jo sign in nahi kar pa rahe. Engineer ne unhe state se baanta: scanners association par reject the (log: status 31), guests WEBAUTH_REQUIRED mein the (list name mismatch). Do chhote fixes, har ek client se proved, chalees tickets band kar gaye.</p><p><b>Lesson:</b> symptom ko pehle state se classify karo, phir log exact defect batata hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao aap aise wireless client ko kaise troubleshoot karte ho jise access nahi mil raha."</p><p>State: client kahan hai (rejected, associated, held, running)? Log: controller ne kya reason record kiya? Policy: configured objects ko us reason se compare karo, ek cheez fix karo, aur client se prove karo. Bolo ki aap badalne se pehle padhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, log, policy, ek change, client se proof.</li>
<li>WEBAUTH_REQUIRED matlab radio theek hai: web server, map, list, AAA check karo.</li>
<li>Leaking ACL: pehle order dekho, phir woh kahan applied hai.</li>
<li>Status 31 aur 43 PMF aur AKM mismatch dikhate hain; policy ya client capability fix karo.</li>
<li>WLANs aur policy profiles sirf shut down hone par edit karo.</li>
</ul></div>
`}};export{e as default};