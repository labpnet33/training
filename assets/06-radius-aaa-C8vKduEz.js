var e={id:`radius-aaa`,h:{en:`RADIUS and AAA on IOS XE: servers, groups, method lists and CoA`,hi:`IOS XE par RADIUS aur AAA: servers, groups, method lists aur CoA`},body:{en:`
<p>802.1X needs a conversation between the controller and an authentication server. That conversation is <b>RADIUS</b>, and the way IOS XE decides which server to ask is <b>AAA</b>. If you understand these two ideas and how three small configuration objects chain together, the 802.1X lab will feel simple.</p>

<h3>What AAA means</h3>
<ul>
<li><b>Authentication:</b> who are you? (alice, with a valid credential)</li>
<li><b>Authorization:</b> what are you allowed to do? (join VLAN 40, get a QoS role)</li>
<li><b>Accounting:</b> what did you do? (session start, stop, bytes, duration)</li>
</ul>
<p>On a controller, RADIUS usually performs all three. In our lab the method list performs authentication, which is what the 802.1X WLAN needs.</p>

<h3>RADIUS in a few facts</h3>
<ul>
<li>Runs over <b>UDP</b>. Authentication on port <b>1812</b>, accounting on <b>1813</b> (older systems used 1645 and 1646).</li>
<li>The client is the controller (the <b>NAS</b>, network access server). The server is RAD1.</li>
<li>Both sides share a <b>shared secret</b>. It is never sent. It is used to sign each reply (the Response Authenticator) and to hide the user password attribute.</li>
<li>Message types: <b>Access-Request</b> (controller to server), then <b>Access-Accept</b>, <b>Access-Reject</b> or <b>Access-Challenge</b> (server to controller). EAP continues through Access-Challenge messages until the final Accept or Reject.</li>
</ul>
<table class="cmp"><tr><th>Attribute</th><th>Direction</th><th>Meaning</th></tr>
<tr><td>User-Name</td><td>Request</td><td>The identity, for example alice</td></tr>
<tr><td>NAS-IP-Address</td><td>Request</td><td>Controller address; the server matches its client list on this</td></tr>
<tr><td>Called-Station-Id</td><td>Request</td><td>AP MAC and SSID</td></tr>
<tr><td>EAP-Message</td><td>Both</td><td>Carries the EAP packets</td></tr>
<tr><td>Tunnel-Private-Group-ID (with Tunnel-Type VLAN)</td><td>Accept</td><td>Dynamic VLAN assignment</td></tr>
<tr><td>Session-Timeout</td><td>Accept</td><td>Re-authentication interval</td></tr></table>
<p>Dynamic VLAN assignment through attributes and per-user policy are real features that the lab does <b>not</b> simulate. In the lab, the VLAN comes from the policy profile PP-CORP.</p>

<h3>The shared secret and the silent drop</h3>
<p>RADIUS has no "wrong key" error message. If the secret on the controller differs from the secret the server holds for that controller, the server cannot validate the request and <b>silently discards it</b>. The controller sees no reply and eventually times out. So the symptom of a key mismatch is <b>timeouts, not rejects</b>. Remember this; it is the heart of the troubleshooting chapter.</p>

<h3>Three objects chain together on IOS XE</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="AAA chain">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#fde68a"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="12">WLAN NK-CORP</text><text x="80" y="94" text-anchor="middle" class="svg-muted" font-size="11">authentication-list</text>
<rect x="175" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Method list</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="11">NK-DOT1X</text>
<rect x="340" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="410" y="76" text-anchor="middle" class="svg-ink" font-size="12">Server group</text><text x="410" y="94" text-anchor="middle" class="svg-muted" font-size="11">RG-NK</text>
<rect x="505" y="50" width="125" height="60" rx="10" fill="#ddd6fe"/><text x="567" y="76" text-anchor="middle" class="svg-ink" font-size="12">Server RAD1</text><text x="567" y="94" text-anchor="middle" class="svg-muted" font-size="11">10.10.60.20, key</text>
<line x1="150" y1="80" x2="175" y2="80" stroke="#64748b"/><line x1="315" y1="80" x2="340" y2="80" stroke="#64748b"/><line x1="480" y1="80" x2="505" y2="80" stroke="#64748b"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Plus the global switch: aaa new-model</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">Break any link and the WLAN has nobody to ask</text>
</svg><p class="cap">WLAN, then method list, then server group, then server. Each name must match exactly.</p></div>
<pre class="code"><span class="c">! 1. Server: address, ports and shared secret</span>
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
 exit
<span class="c">! 2. Turn on the AAA model (without this nothing below works)</span>
aaa new-model
<span class="c">! 3. Group the servers in the order to try them</span>
aaa group server radius RG-NK
 server name RAD1
 exit
<span class="c">! 4. Method list: for dot1x use this group</span>
aaa authentication dot1x NK-DOT1X group RG-NK</pre>
<ul>
<li><code>aaa new-model</code> enables the AAA framework. Before it, method lists and groups cannot be used. The model rejects AAA commands that need it.</li>
<li>The <b>server group</b> lets you list several servers. The controller tries them in order and falls to the next when one does not answer. Real networks use two servers for resilience; our lab has one.</li>
<li>The <b>method list</b> names the policy. A WLAN refers to it by name. On a real 9800 you would normally also add <code>aaa authorization network NK-DOT1X group RG-NK</code> and an accounting list; they are not required in the lab.</li>
<li><code>key 0 NkRadius1</code>: <code>0</code> means clear text typed. Type 7 is a reversible hash that IOS XE shows in the configuration.</li>
</ul>
<pre class="out">WLC1# show radius server-group all
Server group RG-NK
    Sharing Server Group: none
    Server: RAD1 (10.10.60.20)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 0</pre>

<h3>Change of Authorization (CoA)</h3>
<p>RADIUS normally flows from controller to server. <b>CoA</b> (RFC 5176) lets the server push a command to the controller later: disconnect a client or change its policy, for example when ISE sees a compromised endpoint. It uses UDP 3799 on the controller. CoA, posture and redirect URLs are <b>concept only, not simulated in the lab</b>. Coming up: module wl-secure (Advanced security). The server must also be configured as a CoA client with the same secret.</p>
<div class="eg"><p><b>Worked example.</b> A contractor leaves. IT disables his account in the directory. His laptop is still connected, because 802.1X checked him only at join time. IT sends a CoA Disconnect-Request from ISE to WLC1 for his session. The client is deauthenticated at once and cannot rejoin.</p></div>
<div class="warn"><p><b>Common mistake.</b> Typing a mismatched name. If the WLAN says <code>authentication-list NK-DOT1X</code> but the list is called NK-DOTX1, the WLAN has no valid method list.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS encrypts only the password attribute, while TACACS+ encrypts the whole body and separates the three A's. RADIUS is the normal choice for network access (802.1X).</p></div>

<div class="scn"><h4>The server that never saw the request</h4><p>After a RADIUS migration, the new server was not given the controller's address in its client list. WLC1 sent requests with NAS-IP 10.10.99.10. The server found no entry and discarded them. WLC1 counted timeouts and nobody could join NK-CORP. Adding the controller to the server's client list fixed it, with no change on the controller.</p><p><b>Lesson:</b> RADIUS trust is a pair of entries: the server on the controller and the controller on the server.</p></div>
<div class="iv"><p class="q">"What happens if the RADIUS shared secret does not match?"</p><p>The server cannot validate the authenticator and silently drops the request. The controller sees no reply and logs a timeout, so you see timeouts and no Access-Reject. Check the key on both ends and the NAS IP the server expects.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS is UDP 1812 (auth) and 1813 (acct); controller is the NAS.</li>
<li>Chain: WLAN, method list, server group, server, plus aaa new-model.</li>
<li>A wrong secret causes silent drops: timeouts, not rejects.</li>
<li>CoA (UDP 3799) lets the server change a live session; concept only.</li>
<li>Dynamic VLAN attributes are real but not simulated in the lab.</li>
</ul></div>
`,hi:`
<p>802.1X ko controller aur authentication server ke beech conversation chahiye. Woh conversation <b>RADIUS</b> hai, aur IOS XE kaunse server se poochna hai yeh <b>AAA</b> decide karta hai. Agar yeh do ideas aur teen chhote configuration objects ki chain samajh aa jaye, to 802.1X lab simple lagegi.</p>

<h3>AAA ka matlab</h3>
<ul>
<li><b>Authentication:</b> aap kaun ho? (alice, valid credential ke saath)</li>
<li><b>Authorization:</b> aapko kya karne ki permission hai? (VLAN 40 join karna, QoS role)</li>
<li><b>Accounting:</b> aapne kya kiya? (session start, stop, bytes, duration)</li>
</ul>
<p>Controller par RADIUS aam taur par teeno karta hai. Hamari lab mein method list authentication karti hai, jo 802.1X WLAN ko chahiye.</p>

<h3>RADIUS kuch facts mein</h3>
<ul>
<li><b>UDP</b> par chalta hai. Authentication port <b>1812</b>, accounting port <b>1813</b> (purane systems 1645 aur 1646 use karte the).</li>
<li>Client controller hai (<b>NAS</b>, network access server). Server RAD1 hai.</li>
<li>Dono sides ke paas <b>shared secret</b> hota hai. Yeh kabhi bheja nahi jaata. Har reply sign karne (Response Authenticator) aur user password attribute hide karne mein use hota hai.</li>
<li>Message types: <b>Access-Request</b> (controller se server), phir <b>Access-Accept</b>, <b>Access-Reject</b> ya <b>Access-Challenge</b> (server se controller). EAP final Accept ya Reject tak Access-Challenge messages se chalta rehta hai.</li>
</ul>
<table class="cmp"><tr><th>Attribute</th><th>Direction</th><th>Matlab</th></tr>
<tr><td>User-Name</td><td>Request</td><td>Identity, jaise alice</td></tr>
<tr><td>NAS-IP-Address</td><td>Request</td><td>Controller address; server apni client list isi se match karta hai</td></tr>
<tr><td>Called-Station-Id</td><td>Request</td><td>AP MAC aur SSID</td></tr>
<tr><td>EAP-Message</td><td>Dono</td><td>EAP packets carry karta hai</td></tr>
<tr><td>Tunnel-Private-Group-ID (Tunnel-Type VLAN ke saath)</td><td>Accept</td><td>Dynamic VLAN assignment</td></tr>
<tr><td>Session-Timeout</td><td>Accept</td><td>Re-authentication interval</td></tr></table>
<p>Attributes se dynamic VLAN assignment aur per-user policy real features hain jo lab mein simulate <b>nahi</b> hote. Lab mein VLAN policy profile PP-CORP se aata hai.</p>

<h3>Shared secret aur silent drop</h3>
<p>RADIUS mein "wrong key" ka koi error message nahi hota. Agar controller par secret us secret se alag hai jo server us controller ke liye rakhta hai, to server request validate nahi kar sakta aur use <b>chupchaap discard</b> kar deta hai. Controller ko koi reply nahi milta aur aakhir mein timeout hota hai. To key mismatch ka symptom <b>timeouts hai, rejects nahi</b>. Yaad rakho; yeh troubleshooting chapter ka dil hai.</p>

<h3>IOS XE par teen objects ki chain</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="AAA chain">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#fde68a"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="12">WLAN NK-CORP</text><text x="80" y="94" text-anchor="middle" class="svg-muted" font-size="11">authentication-list</text>
<rect x="175" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Method list</text><text x="245" y="94" text-anchor="middle" class="svg-muted" font-size="11">NK-DOT1X</text>
<rect x="340" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="410" y="76" text-anchor="middle" class="svg-ink" font-size="12">Server group</text><text x="410" y="94" text-anchor="middle" class="svg-muted" font-size="11">RG-NK</text>
<rect x="505" y="50" width="125" height="60" rx="10" fill="#ddd6fe"/><text x="567" y="76" text-anchor="middle" class="svg-ink" font-size="12">Server RAD1</text><text x="567" y="94" text-anchor="middle" class="svg-muted" font-size="11">10.10.60.20, key</text>
<line x1="150" y1="80" x2="175" y2="80" stroke="#64748b"/><line x1="315" y1="80" x2="340" y2="80" stroke="#64748b"/><line x1="480" y1="80" x2="505" y2="80" stroke="#64748b"/>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Saath mein global switch: aaa new-model</text>
<text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">Koi bhi link toota to WLAN ke paas poochne wala koi nahi</text>
</svg><p class="cap">WLAN, phir method list, phir server group, phir server. Har naam exactly match hona chahiye.</p></div>
<pre class="code"><span class="c">! 1. Server: address, ports aur shared secret</span>
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
 exit
<span class="c">! 2. AAA model on karo (iske bina neeche kuch kaam nahi karta)</span>
aaa new-model
<span class="c">! 3. Servers ko try karne ke order mein group karo</span>
aaa group server radius RG-NK
 server name RAD1
 exit
<span class="c">! 4. Method list: dot1x ke liye yeh group use karo</span>
aaa authentication dot1x NK-DOT1X group RG-NK</pre>
<ul>
<li><code>aaa new-model</code> AAA framework enable karta hai. Isse pehle method lists aur groups use nahi ho sakte. Model un AAA commands ko reject karta hai jinhe iski zaroorat hai.</li>
<li><b>Server group</b> aapko kai servers list karne deta hai. Controller order mein try karta hai aur jab ek jawab nahi deta to agle par jaata hai. Real networks resilience ke liye do servers use karte hain; hamari lab mein ek hai.</li>
<li><b>Method list</b> policy ko naam deti hai. WLAN use naam se refer karta hai. Real 9800 par aap normally <code>aaa authorization network NK-DOT1X group RG-NK</code> aur accounting list bhi add karoge; lab mein zaroori nahi.</li>
<li><code>key 0 NkRadius1</code>: <code>0</code> ka matlab clear text type kiya. Type 7 reversible hash hai jo IOS XE configuration mein dikhata hai.</li>
</ul>
<pre class="out">WLC1# show radius server-group all
Server group RG-NK
    Sharing Server Group: none
    Server: RAD1 (10.10.60.20)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts 0</pre>

<h3>Change of Authorization (CoA)</h3>
<p>RADIUS normally controller se server ki taraf flow karta hai. <b>CoA</b> (RFC 5176) server ko baad mein controller ko command push karne deta hai: client disconnect karo ya policy badlo, jaise jab ISE ko compromised endpoint dikhe. Yeh controller par UDP 3799 use karta hai. CoA, posture aur redirect URLs <b>concept only, lab mein simulated nahi</b> hain. Aage aane wala module: wl-secure (Advanced security). Server ko bhi same secret ke saath CoA client configure karna padta hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek contractor chhodta hai. IT directory mein uska account disable karta hai. Uska laptop abhi bhi connected hai, kyunki 802.1X ne use sirf join ke time check kiya tha. IT ISE se WLC1 ko uske session ke liye CoA Disconnect-Request bhejta hai. Client turant deauthenticate ho jaata hai aur rejoin nahi kar sakta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Naam galat type karna. Agar WLAN <code>authentication-list NK-DOT1X</code> kehta hai lekin list ka naam NK-DOTX1 hai, to WLAN ke paas valid method list nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS sirf password attribute encrypt karta hai, jabki TACACS+ poori body encrypt karta hai aur teeno A alag karta hai. Network access (802.1X) ke liye RADIUS normal choice hai.</p></div>

<div class="scn"><h4>Server ne request dekhi hi nahi</h4><p>RADIUS migration ke baad naye server ko controller ka address uski client list mein nahi diya gaya. WLC1 NAS-IP 10.10.99.10 ke saath requests bhejta raha. Server ko koi entry nahi mili aur usne unhe discard kiya. WLC1 ne timeouts gine aur NK-CORP par koi join nahi kar paya. Server ki client list mein controller add karne se fix hua, controller par koi change nahi.</p><p><b>Lesson:</b> RADIUS trust entries ka jodi hai: controller par server aur server par controller.</p></div>
<div class="iv"><p class="q">"RADIUS shared secret match na ho to kya hota hai?"</p><p>Server authenticator validate nahi kar sakta aur request chupchaap drop kar deta hai. Controller ko koi reply nahi milta aur timeout log karta hai, to aapko timeouts dikhte hain, Access-Reject nahi. Dono ends par key aur server jo NAS IP expect karta hai woh check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS UDP 1812 (auth) aur 1813 (acct) hai; controller NAS hai.</li>
<li>Chain: WLAN, method list, server group, server, plus aaa new-model.</li>
<li>Galat secret silent drops deta hai: timeouts, rejects nahi.</li>
<li>CoA (UDP 3799) server ko live session badalne deta hai; concept only.</li>
<li>Dynamic VLAN attributes real hain lekin lab mein simulated nahi.</li>
</ul></div>
`}};export{e as default};