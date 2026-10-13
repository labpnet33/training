var e={id:`radius`,h:{en:`RADIUS: central checks, secrets and multi-factor`,hi:`RADIUS: central checks, secrets aur multi-factor`},body:{en:`
<p>RADIUS is the other common way to check a login on a server. The FortiGate acts as the client (the NAS), sends an Access-Request with the user's credentials to a RADIUS server, and receives Access-Accept or Access-Reject. Many identity products speak RADIUS, including network access servers and multi-factor authentication platforms, so it is the usual answer when a company wants one-time codes at the firewall.</p>
<div class="note"><p><b>Reference only.</b> The simulator has no RADIUS client. The block below is a <b>Reference configuration (not run in the simulator)</b>; the secret is a placeholder and no output is shown. For the wider AAA picture on network devices, see <b>sec-aaa-mgmt</b> and <b>sec-ise</b>.</p></div>

<h3>The RADIUS server object</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user radius
    edit "CORP-RADIUS"
        set server "192.0.2.50"
        set secret "SharedSecret-Placeholder"
        set auth-type auto
        set nas-ip 10.0.1.1
    next
end</pre>
<ul>
<li><code>server</code>: the RADIUS server address (a documentation address here).</li>
<li><code>secret</code>: a key shared between the FortiGate and the server. It protects the password in transit and proves that both sides know the same secret. Use a long random value, different per device.</li>
<li><code>auth-type</code>: the method used (PAP, CHAP, MS-CHAP and so on). Auto lets the FortiGate try the usual ones; choose a specific one to match the server's policy.</li>
<li><code>nas-ip</code>: the address the FortiGate presents as itself. The server must list the same address as an allowed client, or the request is ignored.</li>
</ul>
<p>The server also defines which ports it listens on. The usual authentication port is 1812 (older systems use 1645); confirm it on the server you work with.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RADIUS exchange">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="200" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="86" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="265" y="104" text-anchor="middle" class="svg-muted" font-size="12">RADIUS client</text>
<rect x="450" y="60" width="170" height="60" rx="10" fill="#fde68a"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">+ MFA</text>
<line x1="120" y1="90" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="330" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="70" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text><text x="390" y="125" text-anchor="middle" class="svg-muted" font-size="12">Accept / Reject</text>
</svg><p class="cap">The shared secret protects the exchange between the FortiGate and the RADIUS server.</p></div>

<h3>Putting RADIUS users into groups</h3>
<p>RADIUS can only confirm that a login is valid. To grant different access to different people, the server can send a group-style attribute in its reply, and the FortiGate matches it in a group definition. A simpler design is to make a FortiGate group whose member is the RADIUS server, so any user the server accepts belongs to that group:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "VPN-AND-STAFF"
        set group-type firewall
        set member "CORP-RADIUS"
    next
end</pre>
<p>Use this only when everyone the server accepts should receive the same access. If different teams need different rules, use separate groups with a match on the attribute the server returns.</p>

<h3>LDAP or RADIUS?</h3>
<table class="cmp"><tr><th></th><th>LDAP</th><th>RADIUS</th></tr>
<tr><td>Main role</td><td>Directory lookup and password verification</td><td>Network access check, often with MFA</td></tr>
<tr><td>Group information</td><td>Read from the directory</td><td>Returned as reply attributes</td></tr>
<tr><td>Shared secret</td><td>No, bind account instead</td><td>Yes, between client and server</td></tr>
<tr><td>Typical choice</td><td>Staff accounts in Active Directory</td><td>One-time codes, VPN logins, network devices</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A logistics firm wants every firewall login to need a code from a phone app. The MFA platform acts as the RADIUS server. The FortiGate sends the username and password; the server checks them, sends a push to the user's phone, and answers Accept only after the user approves. The firewall configuration is the same as above, because all the extra work happens at the server.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> A mismatched shared secret (the most common cause, and the error looks like a timeout); forgetting to list the firewall as a client on the RADIUS server; using the wrong source address so the server does not recognise the client; putting the real secret in a ticket or chat; and setting too short a timeout for MFA, where users need time to approve.</p></div>
<div class="exam"><p><b>Exam trap.</b> The RADIUS secret is not the user's password. It authenticates the device-to-server link. A wrong secret makes the server drop or reject requests, so every user fails, not just one.</p></div>

<div class="scn"><h4>One-time codes that never arrived</h4><p>After a firewall replacement, all RADIUS logins timed out. The new unit used a different source address and the server did not list it as a client, so it silently ignored every request. Adding the new address on the server fixed all logins at once. The team added the client list to the replacement checklist.</p><p><b>Lesson:</b> RADIUS trusts clients by address and secret; a new device must be registered.</p></div>

<div class="iv"><p class="q">"What is the RADIUS shared secret for, and what happens if it is wrong?"</p><p>It authenticates the FortiGate to the server and protects the password in the request. If it does not match, the server rejects or ignores the packets, so all logins fail or time out. Fix it on both sides and keep a different secret per device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS is a client-server login check: Access-Request, then Accept or Reject.</li>
<li>Key fields: server, secret, auth-type, nas-ip.</li>
<li>A wrong secret or an unregistered client breaks every login.</li>
<li>RADIUS is the usual path to MFA at the firewall.</li>
</ul></div>
`,hi:`
<p>RADIUS login ko server par check karne ka doosra aam tareeka hai. FortiGate client (NAS) ki tarah kaam karta hai, user ke credentials ke saath RADIUS server ko Access-Request bhejta hai, aur Access-Accept ya Access-Reject paata hai. Kai identity products RADIUS bolte hain, jinme network access servers aur multi-factor authentication platforms shaamil hain, isliye jab company firewall par one-time codes chahti hai to yahi aam jawab hai.</p>
<div class="note"><p><b>Reference only.</b> Simulator mein RADIUS client nahi hai. Neeche ka block <b>Reference configuration (not run in the simulator)</b> hai; secret placeholder hai aur koi output nahi dikhaya. Network devices par poori AAA picture ke liye <b>sec-aaa-mgmt</b> aur <b>sec-ise</b> dekho.</p></div>

<h3>RADIUS server object</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user radius
    edit "CORP-RADIUS"
        set server "192.0.2.50"
        set secret "SharedSecret-Placeholder"
        set auth-type auto
        set nas-ip 10.0.1.1
    next
end</pre>
<ul>
<li><code>server</code>: RADIUS server ka address (yahan documentation address).</li>
<li><code>secret</code>: FortiGate aur server ke beech shared key. Yeh transit mein password ko protect karti hai aur saabit karti hai ki dono side ek hi secret jaante hain. Lambi random value use karo, har device ke liye alag.</li>
<li><code>auth-type</code>: use hone wala method (PAP, CHAP, MS-CHAP waghera). Auto FortiGate ko aam wale try karne deta hai; server ki policy se milane ke liye specific chuno.</li>
<li><code>nas-ip</code>: woh address jo FortiGate apne roop mein dikhata hai. Server mein wahi address allowed client ke roop mein listed hona chahiye, warna request ignore hoti hai.</li>
</ul>
<p>Server yeh bhi define karta hai ki woh kaunse ports par sunta hai. Aam authentication port 1812 hai (purane systems 1645 use karte hain); jis server par kaam kar rahe ho wahan confirm karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RADIUS exchange">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="200" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="86" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="265" y="104" text-anchor="middle" class="svg-muted" font-size="12">RADIUS client</text>
<rect x="450" y="60" width="170" height="60" rx="10" fill="#fde68a"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">+ MFA</text>
<line x1="120" y1="90" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="330" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="70" text-anchor="middle" class="svg-accent" font-size="12">Access-Request</text><text x="390" y="125" text-anchor="middle" class="svg-muted" font-size="12">Accept / Reject</text>
</svg><p class="cap">Shared secret FortiGate aur RADIUS server ke beech exchange ko protect karta hai.</p></div>

<h3>RADIUS users ko groups mein daalna</h3>
<p>RADIUS sirf confirm kar sakta hai ki login valid hai. Alag logon ko alag access dene ke liye server apne reply mein group-style attribute bhej sakta hai, aur FortiGate use group definition mein match karta hai. Simple design yeh hai ki aisa FortiGate group banao jiska member RADIUS server ho, taaki server jise accept kare woh us group ka ho:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "VPN-AND-STAFF"
        set group-type firewall
        set member "CORP-RADIUS"
    next
end</pre>
<p>Isse tabhi use karo jab server jise accept kare sabko same access milna ho. Alag teams ko alag rules chahiye to server ke lautaye attribute par match ke saath alag groups use karo.</p>

<h3>LDAP ya RADIUS?</h3>
<table class="cmp"><tr><th></th><th>LDAP</th><th>RADIUS</th></tr>
<tr><td>Main role</td><td>Directory lookup aur password verification</td><td>Network access check, aksar MFA ke saath</td></tr>
<tr><td>Group information</td><td>Directory se padhi jaati hai</td><td>Reply attributes mein aati hai</td></tr>
<tr><td>Shared secret</td><td>Nahi, uski jagah bind account</td><td>Haan, client aur server ke beech</td></tr>
<tr><td>Aam choice</td><td>Active Directory ke staff accounts</td><td>One-time codes, VPN logins, network devices</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek logistics firm chahti hai ki har firewall login ke liye phone app ka code lage. MFA platform RADIUS server ki tarah kaam karta hai. FortiGate username aur password bhejta hai; server unhe check karta hai, user ke phone par push bhejta hai, aur user approve kare tab hi Accept deta hai. Firewall configuration upar jaisi hi hai, kyunki saara extra kaam server par hota hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Shared secret mismatch (sabse aam wajah, aur error timeout jaisa dikhta hai); RADIUS server par firewall ko client ke roop mein list karna bhool jaana; galat source address use karna jisse server client ko pehchaanta nahi; asli secret ticket ya chat mein daalna; aur MFA ke liye bahut chhota timeout rakhna jabki users ko approve karne ka waqt chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS secret user ka password nahi hai. Yeh device-to-server link ko authenticate karta hai. Galat secret se server requests drop ya reject karta hai, isliye har user fail hota hai, sirf ek nahi.</p></div>

<div class="scn"><h4>One-time codes jo kabhi nahi aaye</h4><p>Firewall replace hone ke baad saare RADIUS logins timeout hone lage. Naye unit ka source address alag tha aur server ne use client ki list mein nahi rakha tha, isliye woh har request chupchaap ignore kar raha tha. Server par naya address add karne se saare logins ek saath theek ho gaye. Team ne client list ko replacement checklist mein joda.</p><p><b>Lesson:</b> RADIUS clients ko address aur secret se trust karta hai; naya device register karna padta hai.</p></div>

<div class="iv"><p class="q">"RADIUS shared secret kis liye hai, aur galat ho to kya hota hai?"</p><p>Yeh FortiGate ko server se authenticate karta hai aur request mein password ko protect karta hai. Match na kare to server packets reject ya ignore karta hai, isliye saare logins fail ya timeout hote hain. Dono side fix karo aur har device ke liye alag secret rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS client-server login check hai: Access-Request, phir Accept ya Reject.</li>
<li>Key fields: server, secret, auth-type, nas-ip.</li>
<li>Galat secret ya unregistered client har login tod deta hai.</li>
<li>Firewall par MFA ka aam raasta RADIUS hai.</li>
</ul></div>
`}};export{e as default};