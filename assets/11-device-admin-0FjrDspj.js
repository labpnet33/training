var e={id:`device-admin`,h:{en:`Device administration with TACACS+ in ISE`,hi:`ISE mein TACACS+ ke saath device administration`},body:{en:`
<p>So far ISE has been the security desk for <b>people and devices joining the network</b>. It has a second job: being the security desk for <b>administrators logging in to network devices</b>. The first job is network access (mostly RADIUS); the second is device administration (mostly TACACS+). In the sec-aaa-mgmt module you configured the router and switch side of TACACS+: servers, method lists, command authorization and accounting. This chapter shows the ISE side, so the two halves meet.</p>

<h3>RADIUS vs TACACS+ in one table</h3>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Main use with ISE</td><td>Network access (802.1X, MAB, VPN, guest)</td><td>Device administration (CLI login, command control)</td></tr>
<tr><td>Transport</td><td>UDP 1812/1813 (CoA 1700/3799)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Password attribute only</td><td>Entire payload</td></tr>
<tr><td>AAA separation</td><td>Authentication and authorization combined</td><td>Authentication, authorization and accounting separate</td></tr>
<tr><td>Per-command authorization</td><td>No</td><td>Yes (every command can be checked)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ISE device administration flow">
<rect x="20" y="80" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">Admin anil</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">SSH</text>
<rect x="230" y="80" width="150" height="56" rx="8" fill="#bae6fd"/><text x="305" y="104" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="305" y="122" text-anchor="middle" class="svg-muted" font-size="12">TACACS+ client</text>
<rect x="460" y="50" width="160" height="116" rx="8" fill="#ddd6fe"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text>
<text x="540" y="95" text-anchor="middle" class="svg-muted" font-size="12">Device Admin policy set</text>
<text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">shell profile</text>
<text x="540" y="135" text-anchor="middle" class="svg-muted" font-size="12">command set</text>
<line x1="150" y1="108" x2="230" y2="108" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/><text x="420" y="92" text-anchor="middle" class="svg-accent" font-size="12">TCP 49</text>
<line x1="460" y1="125" x2="380" y2="125" stroke="#64748b" stroke-width="2"/><text x="420" y="145" text-anchor="middle" class="svg-accent" font-size="12">permit / deny</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">every command can be authorized and every command is accounted</text>
</svg><p class="cap">Device administration: the switch asks ISE over TACACS+ to authenticate the admin, set the privilege and approve each command.</p></div>

<h3>Turning it on in ISE</h3>
<ol>
<li><b>License</b>: device administration needs the Device Admin license.</li>
<li><b>Enable the service</b>: Administration &gt; System &gt; Deployment, edit each PSN that should answer TACACS+ and tick <b>Enable Device Admin Service</b>.</li>
<li><b>Network device</b>: the same network device entry gets a <b>TACACS+ shared secret</b> (separate from the RADIUS secret).</li>
<li><b>Results</b> under Work Centers &gt; Device Administration &gt; Policy Elements:
<ul>
<li><b>TACACS profiles</b> (shell profiles): default privilege and maximum privilege, for example NetOps = 15/15, Helpdesk = 1/7.</li>
<li><b>TACACS command sets</b>: ordered permit and deny entries matching a command and its arguments, for example permit show any, permit ping any, deny configure any. The box "Permit any command that is not listed below" decides the default.</li>
</ul></li>
<li><b>Device admin policy sets</b>: like network access policy sets, with an authentication policy (AD or internal users) and an authorization policy whose rules return a <b>command set</b> plus a <b>shell profile</b>.</li>
</ol>

<h3>Example policy</h3>
<table class="cmp"><tr><th>Rule</th><th>Condition</th><th>Command set</th><th>Shell profile</th></tr>
<tr><td>NetOps</td><td>AD group example.local/NetOps</td><td>PermitAll</td><td>Priv15</td></tr>
<tr><td>Helpdesk</td><td>AD group example.local/Helpdesk</td><td>ShowAndPing</td><td>Priv1-max7</td></tr>
<tr><td>Default</td><td></td><td>DenyAllCommands</td><td>Deny All Shell Profile</td></tr>
</table>

<h3>The switch side (recap from sec-aaa-mgmt)</h3>
<pre class="code">tacacs server ISE-TAC
 address ipv4 10.99.99.10
 key NKtac26
aaa group server tacacs+ ISE-TACACS
 server name ISE-TAC
<span class="c">! always keep local fallback for when ISE is unreachable</span>
aaa authentication login VTY group ISE-TACACS local
aaa authorization exec VTY group ISE-TACACS local if-authenticated
aaa authorization commands 15 VTY group ISE-TACACS local if-authenticated
aaa accounting commands 15 VTY start-stop group ISE-TACACS
line vty 0 4
 login authentication VTY
 authorization exec VTY
 authorization commands 15 VTY
 accounting commands 15 VTY</pre>
<p>Notice the use of a named list for VTY lines only. The console keeps a separate list with local login so a failed ISE never locks everyone out.</p>

<pre class="out">ACC-SW1# show tacacs

Tacacs+ Server -  public  :
               Server name: ISE-TAC
            Server address: 10.99.99.10
               Server port: 49
              Socket opens:         12
             Socket closes:         12
<span class="hl">             Total packets in:         36
            Total packets out:         36</span>
          Reference count:          0
             Connection Statistics:</pre>

<div class="eg"><p><b>Worked example.</b> Helpdesk user ravi logs in to ACC-SW1. ISE authenticates him against AD, matches the Helpdesk rule, returns shell profile default privilege 1, maximum 7, and command set ShowAndPing. Ravi types <code>show authentication sessions</code>: the switch sends a TACACS+ authorization request, ISE permits. He types <code>configure terminal</code>: ISE denies, the switch prints "Command authorization failed." In ISE, Operations &gt; TACACS &gt; Live Logs shows both, with the matched command set, and the accounting report shows every command he ran.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling command authorization before the ISE policy is ready, without local fallback, on the console line too. Nobody can configure anything, including the person trying to fix it. Test on the VTY lines with an open console session first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device administration is TACACS+ on TCP 49 with full-payload encryption and per-command authorization. In ISE, a <b>command set</b> controls commands and a <b>shell profile</b> controls privilege levels; both are returned by a device admin authorization rule. The Device Admin Service must be enabled per PSN.</p></div>

<div class="scn"><h4>The contractor who could reload the core</h4><p>An audit found a contractor account with privilege 15 on every switch, because the old local accounts had been copied everywhere. The team moved device administration to ISE: contractors got a shell profile capped at privilege 7 and a command set that allowed show commands and a short list of interface changes, everything else denied. A month later, accounting logs showed the contractor's attempt to run <code>reload</code> being denied, with time, device and username.</p><p><b>Lesson:</b> central TACACS+ in ISE gives least privilege and a full audit trail for administrators, not just endpoints.</p></div>

<div class="iv"><p class="q">"Why use TACACS+ instead of RADIUS for device administration with ISE?"</p><p>Strong answer: TACACS+ uses TCP 49 and encrypts the whole payload, separates authentication, authorization and accounting, and supports per-command authorization and command accounting. In ISE you enable the Device Admin service on PSNs, add a TACACS+ secret to the network device, and build device admin policy sets that return a shell profile for privilege and a command set for allowed commands. Keep local fallback on the device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network access mostly uses RADIUS; device administration uses TACACS+ (TCP 49).</li>
<li>Enable the Device Admin Service on the PSNs and give the network device a TACACS+ secret.</li>
<li>Shell profiles set default and maximum privilege; command sets permit or deny commands.</li>
<li>Device admin policy sets mirror network access policy sets: authentication then authorization.</li>
<li>Always keep local fallback and test command authorization with an open console session.</li>
</ul></div>
`,hi:`
<p>Ab tak ISE <b>network join karne wale logon aur devices</b> ka security desk tha. Uska ek doosra kaam bhi hai: <b>network devices mein login karne wale administrators</b> ka security desk banna. Pehla kaam network access hai (zyada tar RADIUS); doosra device administration hai (zyada tar TACACS+). sec-aaa-mgmt module mein aapne TACACS+ ka router aur switch side configure kiya: servers, method lists, command authorization aur accounting. Yeh chapter ISE side dikhata hai, taaki dono hisse mil jaayein.</p>

<h3>Ek table mein RADIUS vs TACACS+</h3>
<table class="cmp"><tr><th></th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>ISE ke saath main use</td><td>Network access (802.1X, MAB, VPN, guest)</td><td>Device administration (CLI login, command control)</td></tr>
<tr><td>Transport</td><td>UDP 1812/1813 (CoA 1700/3799)</td><td>TCP 49</td></tr>
<tr><td>Encryption</td><td>Sirf password attribute</td><td>Poora payload</td></tr>
<tr><td>AAA separation</td><td>Authentication aur authorization combined</td><td>Authentication, authorization aur accounting alag</td></tr>
<tr><td>Per-command authorization</td><td>Nahi</td><td>Haan (har command check ho sakta hai)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ISE device administration flow">
<rect x="20" y="80" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="85" y="104" text-anchor="middle" class="svg-ink" font-size="13">Admin anil</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="12">SSH</text>
<rect x="230" y="80" width="150" height="56" rx="8" fill="#bae6fd"/><text x="305" y="104" text-anchor="middle" class="svg-ink" font-size="13">ACC-SW1</text><text x="305" y="122" text-anchor="middle" class="svg-muted" font-size="12">TACACS+ client</text>
<rect x="460" y="50" width="160" height="116" rx="8" fill="#ddd6fe"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text>
<text x="540" y="95" text-anchor="middle" class="svg-muted" font-size="12">Device Admin policy set</text>
<text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">shell profile</text>
<text x="540" y="135" text-anchor="middle" class="svg-muted" font-size="12">command set</text>
<line x1="150" y1="108" x2="230" y2="108" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/><text x="420" y="92" text-anchor="middle" class="svg-accent" font-size="12">TCP 49</text>
<line x1="460" y1="125" x2="380" y2="125" stroke="#64748b" stroke-width="2"/><text x="420" y="145" text-anchor="middle" class="svg-accent" font-size="12">permit / deny</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">har command authorize ho sakta hai aur har command account hota hai</text>
</svg><p class="cap">Device administration: switch TACACS+ par ISE se admin ko authenticate karne, privilege set karne aur har command approve karne ko kehta hai.</p></div>

<h3>ISE mein ise on karna</h3>
<ol>
<li><b>License</b>: device administration ko Device Admin license chahiye.</li>
<li><b>Service enable karo</b>: Administration &gt; System &gt; Deployment, har us PSN ko edit karo jo TACACS+ ka jawab de aur <b>Enable Device Admin Service</b> tick karo.</li>
<li><b>Network device</b>: usi network device entry ko ek <b>TACACS+ shared secret</b> milta hai (RADIUS secret se alag).</li>
<li><b>Results</b> Work Centers &gt; Device Administration &gt; Policy Elements ke neeche:
<ul>
<li><b>TACACS profiles</b> (shell profiles): default privilege aur maximum privilege, jaise NetOps = 15/15, Helpdesk = 1/7.</li>
<li><b>TACACS command sets</b>: ordered permit aur deny entries jo command aur uske arguments match karti hain, jaise permit show any, permit ping any, deny configure any. Box "Permit any command that is not listed below" default decide karta hai.</li>
</ul></li>
<li><b>Device admin policy sets</b>: network access policy sets jaise, ek authentication policy (AD ya internal users) aur ek authorization policy ke saath jiske rules <b>command set</b> plus <b>shell profile</b> lautate hain.</li>
</ol>

<h3>Example policy</h3>
<table class="cmp"><tr><th>Rule</th><th>Condition</th><th>Command set</th><th>Shell profile</th></tr>
<tr><td>NetOps</td><td>AD group example.local/NetOps</td><td>PermitAll</td><td>Priv15</td></tr>
<tr><td>Helpdesk</td><td>AD group example.local/Helpdesk</td><td>ShowAndPing</td><td>Priv1-max7</td></tr>
<tr><td>Default</td><td></td><td>DenyAllCommands</td><td>Deny All Shell Profile</td></tr>
</table>

<h3>Switch side (sec-aaa-mgmt se recap)</h3>
<pre class="code">tacacs server ISE-TAC
 address ipv4 10.99.99.10
 key NKtac26
aaa group server tacacs+ ISE-TACACS
 server name ISE-TAC
<span class="c">! ISE unreachable ho to hamesha local fallback rakho</span>
aaa authentication login VTY group ISE-TACACS local
aaa authorization exec VTY group ISE-TACACS local if-authenticated
aaa authorization commands 15 VTY group ISE-TACACS local if-authenticated
aaa accounting commands 15 VTY start-stop group ISE-TACACS
line vty 0 4
 login authentication VTY
 authorization exec VTY
 authorization commands 15 VTY
 accounting commands 15 VTY</pre>
<p>Dhyan do ki named list sirf VTY lines ke liye use hui hai. Console local login wali alag list rakhta hai taaki fail hua ISE kabhi sabko lock out na kare.</p>

<pre class="out">ACC-SW1# show tacacs

Tacacs+ Server -  public  :
               Server name: ISE-TAC
            Server address: 10.99.99.10
               Server port: 49
              Socket opens:         12
             Socket closes:         12
<span class="hl">             Total packets in:         36
            Total packets out:         36</span>
          Reference count:          0
             Connection Statistics:</pre>

<div class="eg"><p><b>Worked example.</b> Helpdesk user ravi ACC-SW1 mein login karta hai. ISE use AD ke against authenticate karta hai, Helpdesk rule match karta hai, shell profile default privilege 1, maximum 7, aur command set ShowAndPing lautata hai. Ravi <code>show authentication sessions</code> type karta hai: switch TACACS+ authorization request bhejta hai, ISE permit karta hai. Woh <code>configure terminal</code> type karta hai: ISE deny karta hai, switch print karta hai "Command authorization failed." ISE mein Operations &gt; TACACS &gt; Live Logs dono dikhata hai, matched command set ke saath, aur accounting report uske chalaye har command dikhati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> ISE policy ready hone se pehle, bina local fallback ke, console line par bhi command authorization enable karna. Koi kuch configure nahi kar sakta, us insaan samet jo ise theek karne ki koshish kar raha hai. Pehle open console session ke saath VTY lines par test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device administration TCP 49 par TACACS+ hai, full-payload encryption aur per-command authorization ke saath. ISE mein <b>command set</b> commands control karta hai aur <b>shell profile</b> privilege levels; dono device admin authorization rule se lautte hain. Device Admin Service har PSN par enable karni padti hai.</p></div>

<div class="scn"><h4>Woh contractor jo core reload kar sakta tha</h4><p>Ek audit mein ek contractor account mila jiske paas har switch par privilege 15 tha, kyunki purane local accounts har jagah copy hue the. Team ne device administration ISE par shift kiya: contractors ko privilege 7 tak capped shell profile aur ek command set mila jo show commands aur interface changes ki chhoti list allow karta tha, baaki sab deny. Ek mahine baad accounting logs ne contractor ki <code>reload</code> chalane ki koshish deny hote dikhayi, time, device aur username ke saath.</p><p><b>Seekh:</b> ISE mein central TACACS+ sirf endpoints nahi, administrators ke liye bhi least privilege aur poora audit trail deta hai.</p></div>

<div class="iv"><p class="q">"ISE ke saath device administration ke liye RADIUS ki jagah TACACS+ kyun?"</p><p>Strong answer: TACACS+ TCP 49 use karta hai aur poora payload encrypt karta hai, authentication, authorization aur accounting alag karta hai, aur per-command authorization aur command accounting support karta hai. ISE mein aap PSNs par Device Admin service enable karte ho, network device mein TACACS+ secret jodte ho, aur device admin policy sets banaate ho jo privilege ke liye shell profile aur allowed commands ke liye command set lautate hain. Device par local fallback rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network access zyada tar RADIUS use karta hai; device administration TACACS+ (TCP 49).</li>
<li>PSNs par Device Admin Service enable karo aur network device ko TACACS+ secret do.</li>
<li>Shell profiles default aur maximum privilege set karte hain; command sets commands permit ya deny karte hain.</li>
<li>Device admin policy sets network access policy sets jaise hain: pehle authentication phir authorization.</li>
<li>Hamesha local fallback rakho aur open console session ke saath command authorization test karo.</li>
</ul></div>
`}};export{e as default};