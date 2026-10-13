var e={id:`ldap`,h:{en:`LDAP and Active Directory: one directory for all accounts`,hi:`LDAP aur Active Directory: sab accounts ke liye ek directory`},body:{en:`
<p>Most companies already keep their accounts in a directory, usually Microsoft Active Directory. Typing the same people again into every firewall is slow and risky: someone leaves, the directory is updated, but the old firewall account lives on. With <b>LDAP</b> the FortiGate asks the directory to check each login, so one account serves the network, the mail and the firewall.</p>
<div class="note"><p><b>Reference only.</b> The simulator has no LDAP client and no directory to talk to. The block below is a <b>Reference configuration (not run in the simulator)</b>, shown with the .example domain and a placeholder password. No output is shown because none could be captured.</p></div>

<h3>How an LDAP login works</h3>
<ol>
<li>The user enters a name and password at the firewall's login prompt.</li>
<li>The FortiGate connects to the LDAP server and, using a service account (the bind user), searches for the user's entry under the base DN.</li>
<li>It then tries to bind as that user with the typed password. If the directory accepts it, the login succeeds.</li>
<li>The FortiGate reads the user's group membership and matches it against the groups used in policies.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="LDAP login">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="200" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="95" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text>
<rect x="450" y="60" width="170" height="60" rx="10" fill="#fde68a"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="13">LDAP server</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">Active Directory</text>
<line x1="120" y1="90" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="330" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="70" text-anchor="middle" class="svg-accent" font-size="12">search + bind</text><text x="390" y="125" text-anchor="middle" class="svg-muted" font-size="12">accept + groups</text>
</svg><p class="cap">The firewall never sees the stored password; it asks the directory to verify it.</p></div>

<h3>The LDAP server object</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user ldap
    edit "CORP-AD"
        set server "dc1.corp.example"
        set cnid "sAMAccountName"
        set dn "dc=corp,dc=example"
        set type regular
        set username "cn=svc-fgt,ou=service,dc=corp,dc=example"
        set password "ServiceAcct-Placeholder"
        set secure ldaps
        set port 636
    next
end</pre>
<ul>
<li><code>server</code>: the directory host name or address. Use a name that resolves, or a documentation or private address in a lab.</li>
<li><code>cnid</code>: the attribute that holds the login name. For Active Directory this is usually <code>sAMAccountName</code>.</li>
<li><code>dn</code>: the base of the search. A smaller base is faster and exposes less.</li>
<li><code>username</code> and <code>password</code>: the bind account. Give it read-only rights and a strong password; the placeholder above must never be used.</li>
<li><code>secure ldaps</code> with port 636 encrypts the exchange. Plain LDAP on port 389 sends data in clear and should be avoided for passwords.</li>
</ul>

<h3>Use directory groups in policies</h3>
<p>A FortiGate group can point to the remote server, and a <code>config match</code> entry maps a directory group to it:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-USERS"
        set group-type firewall
        set member "CORP-AD"
        config match
            edit 1
                set server-name "CORP-AD"
                set group-name "cn=Finance,ou=groups,dc=corp,dc=example"
            next
        end
    next
end</pre>
<p>A person who belongs to the Finance group in the directory now belongs to FINANCE-USERS on the firewall, and no one creates users on the FortiGate.</p>

<div class="eg"><p><b>Worked example.</b> A retail company has 300 staff. HR adds a new cashier to the directory group "Stores". The same morning she logs in at a store PC; the FortiGate checks CORP-AD, sees the group and applies the store policy. When she resigns, disabling the directory account removes firewall access with no firewall change.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Using plain LDAP for password checks; giving the bind account domain-admin rights; a wrong <code>cnid</code> so every search fails; a base DN that does not contain the users; forgetting that the firewall must reach the LDAP server on the correct port and that the certificate or name must match when using LDAPS.</p></div>
<div class="exam"><p><b>Exam trap.</b> The bind account is used to search; the user's own password is used to verify. They are two different steps. Also, <code>cnid</code> is the login-name attribute, not the group attribute.</p></div>

<div class="scn"><h4>Everyone failed at 09:00</h4><p>After the directory team rotated the service account password, every LDAP login on the FortiGate failed. The server was reachable, so the network looked fine. The fix was to update the stored bind password on the firewall. The team added the service account to its rotation checklist so both sides change together.</p><p><b>Lesson:</b> when all logins fail at once, suspect the shared bind account before the users.</p></div>

<div class="iv"><p class="q">"How does a FortiGate authenticate a user against Active Directory over LDAP?"</p><p>It binds with a service account, searches the base DN for the user (using the cnid attribute, usually sAMAccountName), then verifies the typed password by binding as that user. Group membership is read afterwards and matched against firewall groups. Recommend LDAPS on port 636 and a read-only bind account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LDAP lets the firewall reuse the directory instead of local accounts.</li>
<li>Key fields: server, cnid, dn, bind username and password, secure ldaps, port 636.</li>
<li>A <code>config match</code> entry maps a directory group to a firewall group.</li>
<li>Use LDAPS and a least-privilege bind account.</li>
</ul></div>
`,hi:`
<p>Zyadatar companies ke accounts pehle se ek directory mein hote hain, aam taur par Microsoft Active Directory. Wahi logon ko har firewall mein dobara type karna slow aur risky hai: koi chala jaata hai, directory update hoti hai, lekin purane firewall ka account zinda rehta hai. <b>LDAP</b> ke saath FortiGate har login directory se check karwata hai, isliye ek account network, mail aur firewall teeno ke liye chalta hai.</p>
<div class="note"><p><b>Reference only.</b> Simulator mein LDAP client nahi hai aur baat karne ke liye directory bhi nahi. Neeche ka block <b>Reference configuration (not run in the simulator)</b> hai, .example domain aur placeholder password ke saath. Koi output nahi dikhaya kyunki capture nahi ho sakta tha.</p></div>

<h3>LDAP login kaise chalta hai</h3>
<ol>
<li>User firewall ke login prompt par naam aur password daalta hai.</li>
<li>FortiGate LDAP server se connect karta hai aur service account (bind user) se base DN ke neeche user ki entry search karta hai.</li>
<li>Phir woh typed password ke saath us user ke roop mein bind karne ki koshish karta hai. Directory accept kare to login succeed hota hai.</li>
<li>FortiGate user ki group membership padhta hai aur policies mein use hone wale groups se match karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="LDAP login">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="200" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="265" y="95" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text>
<rect x="450" y="60" width="170" height="60" rx="10" fill="#fde68a"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="13">LDAP server</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">Active Directory</text>
<line x1="120" y1="90" x2="200" y2="90" stroke="#64748b" stroke-width="2"/><line x1="330" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="70" text-anchor="middle" class="svg-accent" font-size="12">search + bind</text><text x="390" y="125" text-anchor="middle" class="svg-muted" font-size="12">accept + groups</text>
</svg><p class="cap">Firewall stored password kabhi nahi dekhta; woh directory se verify karwata hai.</p></div>

<h3>LDAP server object</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user ldap
    edit "CORP-AD"
        set server "dc1.corp.example"
        set cnid "sAMAccountName"
        set dn "dc=corp,dc=example"
        set type regular
        set username "cn=svc-fgt,ou=service,dc=corp,dc=example"
        set password "ServiceAcct-Placeholder"
        set secure ldaps
        set port 636
    next
end</pre>
<ul>
<li><code>server</code>: directory ka host name ya address. Aisa naam use karo jo resolve ho, ya lab mein documentation ya private address.</li>
<li><code>cnid</code>: woh attribute jisme login name hota hai. Active Directory ke liye aam taur par <code>sAMAccountName</code>.</li>
<li><code>dn</code>: search ka base. Chhota base tez hai aur kam expose karta hai.</li>
<li><code>username</code> aur <code>password</code>: bind account. Use read-only rights aur strong password do; upar ka placeholder kabhi use mat karo.</li>
<li>Port 636 ke saath <code>secure ldaps</code> exchange encrypt karta hai. Port 389 par plain LDAP data clear mein bhejta hai aur passwords ke liye avoid karna chahiye.</li>
</ul>

<h3>Policies mein directory groups use karna</h3>
<p>FortiGate group remote server ki taraf point kar sakta hai, aur <code>config match</code> entry directory group ko usse map karti hai:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config user group
    edit "FINANCE-USERS"
        set group-type firewall
        set member "CORP-AD"
        config match
            edit 1
                set server-name "CORP-AD"
                set group-name "cn=Finance,ou=groups,dc=corp,dc=example"
            next
        end
    next
end</pre>
<p>Directory mein Finance group ka member ab firewall par FINANCE-USERS ka member hai, aur FortiGate par koi users nahi banata.</p>

<div class="eg"><p><b>Worked example.</b> Ek retail company mein 300 staff hain. HR naye cashier ko directory group "Stores" mein add karta hai. Usi subah woh store PC par login karti hai; FortiGate CORP-AD check karta hai, group dekhta hai aur store policy lagata hai. Jab woh resign karti hai, directory account disable karne se firewall access bina firewall change ke hat jaata hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Password check ke liye plain LDAP use karna; bind account ko domain-admin rights dena; galat <code>cnid</code> jisse har search fail ho; aisa base DN jisme users nahi hain; bhoolna ki firewall ko sahi port par LDAP server tak pahunchna hoga aur LDAPS mein certificate ya naam match hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bind account search ke liye use hota hai; user ka apna password verify ke liye. Yeh do alag steps hain. Aur <code>cnid</code> login-name attribute hai, group attribute nahi.</p></div>

<div class="scn"><h4>Subah 09:00 sab fail</h4><p>Directory team ne service account ka password rotate kiya, uske baad FortiGate par har LDAP login fail ho gaya. Server reachable tha, isliye network theek lag raha tha. Fix yeh tha ki firewall par stored bind password update kiya jaye. Team ne service account ko rotation checklist mein joda taaki dono side saath badlein.</p><p><b>Lesson:</b> jab sab logins ek saath fail hon, users se pehle shared bind account par shak karo.</p></div>

<div class="iv"><p class="q">"FortiGate LDAP se Active Directory ke against user ko kaise authenticate karta hai?"</p><p>Woh service account se bind karta hai, base DN mein user search karta hai (cnid attribute se, aam taur par sAMAccountName), phir typed password ke saath us user ke roop mein bind karke verify karta hai. Uske baad group membership padhi jaati hai aur firewall groups se match hoti hai. Port 636 par LDAPS aur read-only bind account recommend karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LDAP firewall ko local accounts ki jagah directory reuse karne deta hai.</li>
<li>Key fields: server, cnid, dn, bind username aur password, secure ldaps, port 636.</li>
<li><code>config match</code> entry directory group ko firewall group se map karti hai.</li>
<li>LDAPS aur least-privilege bind account use karo.</li>
</ul></div>
`}};export{e as default};