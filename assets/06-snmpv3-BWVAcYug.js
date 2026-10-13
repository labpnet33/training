var e={id:`snmpv3`,h:{en:`SNMPv3: views, groups, users and the three security levels`,hi:`SNMPv3: views, groups, users aur teen security levels`},body:{en:`
<p>Imagine a building's electricity meter. With SNMPv1 and v2c, anyone who knows the word written on the meter box ("public") can open it and read it, and anyone who knows a second word ("private") can rewire it, all while shouting the word across the street. SNMPv3 replaces the shouted word with a personal key card that proves who you are, a sealed envelope so nobody else can read the numbers, and a rule sheet listing exactly which dials each person may look at.</p>

<h3>SNMP in one paragraph</h3>
<p>An <b>NMS</b> (network management station, the manager) polls an <b>agent</b> on each device over <b>UDP 161</b> with GET, GETNEXT, GETBULK and SET requests. The agent can also push <b>notifications</b> (traps, or acknowledged informs) to the manager on <b>UDP 162</b>. The data is organised in a <b>MIB</b>, a tree of <b>OIDs</b>; for example <code>sysName.0</code> is 1.3.6.1.2.1.1.5.0. In v1 and v2c the only protection is a <b>community string</b> sent in clear text, which works as a password that anyone on the path can sniff. A read-write (RW) community is effectively a clear-text write password for the whole device.</p>

<h3>The SNMPv3 security model</h3>
<p>SNMPv3 adds two frameworks. The <b>User-based Security Model (USM)</b> handles authentication (HMAC with SHA, or legacy MD5) and privacy (encryption with AES, or legacy DES). The <b>View-based Access Control Model (VACM)</b> decides which OIDs a user may read, write or receive notifications for. The combination of authentication and privacy gives three <b>security levels</b>:</p>
<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Authentication</th><th>Encryption</th></tr>
<tr><td>noAuthNoPriv</td><td><code>noauth</code></td><td>username only</td><td>none</td></tr>
<tr><td>authNoPriv</td><td><code>auth</code></td><td>HMAC-SHA (or MD5)</td><td>none</td></tr>
<tr><td>authPriv</td><td><code>priv</code></td><td>HMAC-SHA (or MD5)</td><td>AES-128/192/256 (or DES)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SNMPv3 view group user">
<rect x="20" y="80" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="104" text-anchor="middle" class="svg-ink" font-size="13">user nkadmin</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">SHA + AES 128</text>
<rect x="245" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">group NKADMIN</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, read view</text>
<rect x="470" y="80" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="13">view NKVIEW</text><text x="545" y="122" text-anchor="middle" class="svg-muted" font-size="12">iso included</text>
<line x1="170" y1="110" x2="245" y2="110" stroke="#64748b" stroke-width="2"/><line x1="395" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="207" y="100" text-anchor="middle" class="svg-accent" font-size="12">member of</text><text x="432" y="100" text-anchor="middle" class="svg-accent" font-size="12">may read</text>
<text x="95" y="170" text-anchor="middle" class="svg-muted" font-size="12">who + keys (USM)</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">level + rights (VACM)</text><text x="545" y="170" text-anchor="middle" class="svg-muted" font-size="12">which OIDs</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">Build it right to left: view, then group, then user</text>
</svg><p class="cap">A user belongs to a group; the group sets the minimum security level and points to views.</p></div>

<h3>Configuration, built right to left</h3>
<pre class="code"><span class="c">! 1. view: which part of the MIB tree</span>
snmp-server view NKVIEW iso included
<span class="c">! a tighter view for a NOC tool could be:</span>
<span class="c">! snmp-server view NOC-VIEW system included</span>
<span class="c">! snmp-server view NOC-VIEW interfaces included</span>
<span class="c">! 2. group: v3, minimum level priv, read-only view, source ACL</span>
ip access-list standard SNMP-NMS
 permit 10.10.12.9
snmp-server group NKADMIN v3 priv read NKVIEW access SNMP-NMS
<span class="c">! 3. user: auth SHA and privacy AES 128 (lab values)</span>
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
<span class="c">! 4. optional: SNMPv3 notifications to the NMS</span>
snmp-server enable traps
snmp-server host 10.10.12.9 version 3 priv nkadmin</pre>
<p>A group without a <code>write</code> view is read-only, which is what monitoring needs. The <b>security level on the group is a minimum</b>: a group defined with <code>priv</code> rejects requests from users at auth or noauth level.</p>

<h3>Things that surprise people</h3>
<ul>
<li><b>Users do not appear in the running-config.</b> The passwords are turned into keys localised to the device's <b>engine ID</b> and stored separately. Use <code>show snmp user</code> to see them, and keep the user command in your own build documents.</li>
<li><b>Changing the engine ID invalidates every user.</b> The localised keys depend on it, so after <code>snmp-server engineID local</code> changes you must re-create the users.</li>
<li><b>SHA-1 and AES-128 are the common baseline</b>; many current releases also offer stronger SHA-2 authentication and AES-192/256. Avoid MD5 and DES in new designs.</li>
</ul>

<pre class="out">R1# show snmp user
User name: <span class="hl">nkadmin</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
<span class="hl">Authentication Protocol: SHA</span>
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NKADMIN

R1# show snmp group
groupname: NKADMIN                          <span class="hl">security model:v3 priv</span>
contextname: &lt;no context specified&gt;         storage-type: nonvolatile
readview : NKVIEW                           writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active      access-list: SNMP-NMS</pre>

<h3>Testing from the NMS</h3>
<pre class="out">NMS&gt; snmpget -v3 -u nkadmin -l authPriv -a sha -A AuthPass!26 -x aes -X PrivPass!26 10.10.10.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span>

NMS&gt; snmpget -v3 -u nkadmin -l authPriv -a sha -A WrongPass -x aes -X PrivPass!26 10.10.10.1 sysName.0
<span class="hl">snmpget: Authentication failure (incorrect password, community or key)</span></pre>

<div class="eg"><p><b>Worked example (Lab 3, tasks 1 and 2).</b> On R1 you create view NKVIEW (iso included), group NKADMIN at v3 priv reading NKVIEW, and user nkadmin with SHA AuthPass!26 and AES 128 PrivPass!26. From NMS (10.10.12.9) the poll with <code>-l authPriv</code> returns <code>sysName.0 = STRING: R1</code>. The same poll with a wrong auth password returns "Authentication failure". A poll with <code>-l authNoPriv</code> is also refused, because the group demands priv.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding SNMPv3 but leaving the old <code>snmp-server community public RO</code> and <code>private RW</code> lines in place. The device is exactly as exposed as before. Remove every v1/v2c community once the NMS is migrated.</p></div>

<div class="exam"><p><b>Exam trap.</b> authNoPriv authenticates but does not encrypt; only authPriv provides both. The order of objects is view, group, user. The group's level is a minimum. SNMP polls use UDP 161, notifications UDP 162.</p></div>

<div class="scn"><h4>The community string in the packet capture</h4><p>During a penetration test, the tester captured SNMP traffic on a management VLAN and read the v2c RW community in clear text. With it she could have changed interface states and downloaded the configuration through the CISCO-CONFIG-COPY-MIB. The remediation: SNMPv3 authPriv with SHA and AES for every poller, a source ACL on the group, removal of all communities, and a CIS audit check that fails on any RW community.</p><p><b>Lesson:</b> SNMPv1/v2c communities are clear-text passwords; SNMPv3 authPriv plus an ACL is the minimum for monitoring.</p></div>

<div class="iv"><p class="q">"Explain the three SNMPv3 security levels and how you configure authPriv on IOS."</p><p>noAuthNoPriv = username only; authNoPriv = HMAC authentication, no encryption; authPriv = authentication plus AES encryption. Configure a view, a group with <code>v3 priv</code> pointing to the read view (plus an ACL), then a user in that group with <code>auth sha ... priv aes 128 ...</code>. Mention that users are not shown in the running-config and depend on the engine ID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP: UDP 161 for polls, UDP 162 for traps and informs; v1/v2c communities are clear-text passwords.</li>
<li>SNMPv3 = USM (authentication and privacy) + VACM (views).</li>
<li>noAuthNoPriv, authNoPriv, authPriv; only authPriv encrypts.</li>
<li>Build view, then group (<code>v3 priv</code>, read view, ACL), then user (SHA + AES).</li>
<li>Users are not in the running-config, are tied to the engine ID, and old communities must be removed.</li>
</ul></div>
`,hi:`
<p>Ek building ke bijli meter ko socho. SNMPv1 aur v2c ke saath, jo bhi meter box par likha shabd ("public") jaanta hai woh use khol kar padh sakta hai, aur jo doosra shabd ("private") jaanta hai woh use rewire kar sakta hai, aur yeh sab karte hue woh shabd sadak ke paar chilla kar bolta hai. SNMPv3 chillaye gaye shabd ki jagah ek personal key card deta hai jo sabit karta hai aap kaun ho, ek sealed envelope taaki koi aur numbers na padh sake, aur ek rule sheet jo batati hai ki har insaan kaunse dials dekh sakta hai.</p>

<h3>SNMP ek paragraph mein</h3>
<p>Ek <b>NMS</b> (network management station, manager) har device par ek <b>agent</b> ko <b>UDP 161</b> par GET, GETNEXT, GETBULK aur SET requests se poll karta hai. Agent manager ko <b>UDP 162</b> par <b>notifications</b> (traps, ya acknowledged informs) bhi push kar sakta hai. Data ek <b>MIB</b> mein organised hota hai, <b>OIDs</b> ka ek tree; jaise <code>sysName.0</code> 1.3.6.1.2.1.1.5.0 hai. v1 aur v2c mein ek hi protection hai <b>community string</b> jo clear text mein jaati hai, jo ek password ki tarah kaam karti hai jise path par koi bhi sniff kar sakta hai. Read-write (RW) community asal mein poore device ka clear-text write password hai.</p>

<h3>SNMPv3 security model</h3>
<p>SNMPv3 do frameworks jodta hai. <b>User-based Security Model (USM)</b> authentication (SHA ke saath HMAC, ya legacy MD5) aur privacy (AES se encryption, ya legacy DES) handle karta hai. <b>View-based Access Control Model (VACM)</b> tay karta hai ki user kaunse OIDs read, write ya notifications ke liye receive kar sakta hai. Authentication aur privacy ka combination teen <b>security levels</b> deta hai:</p>
<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Authentication</th><th>Encryption</th></tr>
<tr><td>noAuthNoPriv</td><td><code>noauth</code></td><td>sirf username</td><td>kuch nahi</td></tr>
<tr><td>authNoPriv</td><td><code>auth</code></td><td>HMAC-SHA (ya MD5)</td><td>kuch nahi</td></tr>
<tr><td>authPriv</td><td><code>priv</code></td><td>HMAC-SHA (ya MD5)</td><td>AES-128/192/256 (ya DES)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SNMPv3 view group user">
<rect x="20" y="80" width="150" height="60" rx="8" fill="#fde68a"/><text x="95" y="104" text-anchor="middle" class="svg-ink" font-size="13">user nkadmin</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">SHA + AES 128</text>
<rect x="245" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">group NKADMIN</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, read view</text>
<rect x="470" y="80" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="13">view NKVIEW</text><text x="545" y="122" text-anchor="middle" class="svg-muted" font-size="12">iso included</text>
<line x1="170" y1="110" x2="245" y2="110" stroke="#64748b" stroke-width="2"/><line x1="395" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="207" y="100" text-anchor="middle" class="svg-accent" font-size="12">member hai</text><text x="432" y="100" text-anchor="middle" class="svg-accent" font-size="12">read kar sakta</text>
<text x="95" y="170" text-anchor="middle" class="svg-muted" font-size="12">kaun + keys (USM)</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">level + rights (VACM)</text><text x="545" y="170" text-anchor="middle" class="svg-muted" font-size="12">kaunse OIDs</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">Right se left banao: view, phir group, phir user</text>
</svg><p class="cap">User ek group ka member hai; group minimum security level set karta hai aur views ki taraf point karta hai.</p></div>

<h3>Configuration, right se left</h3>
<pre class="code"><span class="c">! 1. view: MIB tree ka kaunsa hissa</span>
snmp-server view NKVIEW iso included
<span class="c">! NOC tool ke liye tight view aisa ho sakta hai:</span>
<span class="c">! snmp-server view NOC-VIEW system included</span>
<span class="c">! snmp-server view NOC-VIEW interfaces included</span>
<span class="c">! 2. group: v3, minimum level priv, read-only view, source ACL</span>
ip access-list standard SNMP-NMS
 permit 10.10.12.9
snmp-server group NKADMIN v3 priv read NKVIEW access SNMP-NMS
<span class="c">! 3. user: auth SHA aur privacy AES 128 (lab values)</span>
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
<span class="c">! 4. optional: NMS ko SNMPv3 notifications</span>
snmp-server enable traps
snmp-server host 10.10.12.9 version 3 priv nkadmin</pre>
<p>Bina <code>write</code> view wala group read-only hai, jo monitoring ko chahiye. <b>Group par security level ek minimum hai</b>: <code>priv</code> ke saath define group auth ya noauth level wale users ki requests reject karta hai.</p>

<h3>Cheezein jo logon ko surprise karti hain</h3>
<ul>
<li><b>Users running-config mein nahi dikhte.</b> Passwords device ke <b>engine ID</b> par localised keys mein badle jaate hain aur alag store hote hain. Unhe dekhne ke liye <code>show snmp user</code> use karo, aur user command apne build documents mein rakho.</li>
<li><b>Engine ID badalne se har user invalid ho jaata hai.</b> Localised keys us par depend karti hain, isliye <code>snmp-server engineID local</code> badalne ke baad users dobara banane padte hain.</li>
<li><b>SHA-1 aur AES-128 common baseline hain</b>; kai current releases stronger SHA-2 authentication aur AES-192/256 bhi dete hain. Naye designs mein MD5 aur DES se bacho.</li>
</ul>

<pre class="out">R1# show snmp user
User name: <span class="hl">nkadmin</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
<span class="hl">Authentication Protocol: SHA</span>
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NKADMIN

R1# show snmp group
groupname: NKADMIN                          <span class="hl">security model:v3 priv</span>
contextname: &lt;no context specified&gt;         storage-type: nonvolatile
readview : NKVIEW                           writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active      access-list: SNMP-NMS</pre>

<h3>NMS se testing</h3>
<pre class="out">NMS&gt; snmpget -v3 -u nkadmin -l authPriv -a sha -A AuthPass!26 -x aes -X PrivPass!26 10.10.10.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span>

NMS&gt; snmpget -v3 -u nkadmin -l authPriv -a sha -A WrongPass -x aes -X PrivPass!26 10.10.10.1 sysName.0
<span class="hl">snmpget: Authentication failure (incorrect password, community or key)</span></pre>

<div class="eg"><p><b>Worked example (Lab 3, tasks 1 aur 2).</b> R1 par aap view NKVIEW (iso included), NKVIEW read karne wala v3 priv group NKADMIN, aur SHA AuthPass!26 aur AES 128 PrivPass!26 ke saath user nkadmin banate ho. NMS (10.10.12.9) se <code>-l authPriv</code> wala poll <code>sysName.0 = STRING: R1</code> lautata hai. Galat auth password ke saath wahi poll "Authentication failure" lautata hai. <code>-l authNoPriv</code> wala poll bhi refuse hota hai, kyunki group priv maangta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> SNMPv3 jodna par purani <code>snmp-server community public RO</code> aur <code>private RW</code> lines wahin chhod dena. Device pehle jitna hi exposed hai. NMS migrate hone ke baad har v1/v2c community hatao.</p></div>

<div class="exam"><p><b>Exam trap.</b> authNoPriv authenticate karta hai par encrypt nahi; sirf authPriv dono deta hai. Objects ka order view, group, user hai. Group ka level ek minimum hai. SNMP polls UDP 161 use karte hain, notifications UDP 162.</p></div>

<div class="scn"><h4>Packet capture mein community string</h4><p>Ek penetration test ke dauraan, tester ne management VLAN par SNMP traffic capture kiya aur v2c RW community clear text mein padh li. Isse woh interface states badal sakti thi aur CISCO-CONFIG-COPY-MIB se configuration download kar sakti thi. Remediation: har poller ke liye SHA aur AES ke saath SNMPv3 authPriv, group par source ACL, saari communities hatana, aur ek CIS audit check jo kisi bhi RW community par fail ho.</p><p><b>Seekh:</b> SNMPv1/v2c communities clear-text passwords hain; monitoring ke liye SNMPv3 authPriv plus ACL minimum hai.</p></div>

<div class="iv"><p class="q">"SNMPv3 ke teen security levels samjhao aur IOS par authPriv kaise configure karte ho."</p><p>noAuthNoPriv = sirf username; authNoPriv = HMAC authentication, encryption nahi; authPriv = authentication plus AES encryption. Ek view configure karo, read view ki taraf point karne wala <code>v3 priv</code> group (plus ACL), phir us group mein <code>auth sha ... priv aes 128 ...</code> ke saath user. Batao ki users running-config mein nahi dikhte aur engine ID par depend karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP: polls ke liye UDP 161, traps aur informs ke liye UDP 162; v1/v2c communities clear-text passwords hain.</li>
<li>SNMPv3 = USM (authentication aur privacy) + VACM (views).</li>
<li>noAuthNoPriv, authNoPriv, authPriv; sirf authPriv encrypt karta hai.</li>
<li>Pehle view banao, phir group (<code>v3 priv</code>, read view, ACL), phir user (SHA + AES).</li>
<li>Users running-config mein nahi hote, engine ID se bandhe hain, aur purani communities hatani zaroori hain.</li>
</ul></div>
`}};export{e as default};