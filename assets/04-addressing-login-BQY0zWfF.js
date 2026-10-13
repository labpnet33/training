var e={id:`login`,h:{en:`Addressing and login: WWNs, FCIDs, port types, FLOGI, PLOGI, PRLI and the name server`,hi:`Addressing aur login: WWNs, FCIDs, port types, FLOGI, PLOGI, PRLI aur name server`},body:{en:`
<p>Every person in a country has a permanent identity number that never changes, and a postal address that depends on where they currently live. Fibre Channel uses exactly the same idea. The <b>World Wide Name</b> is the identity number, burnt in and permanent. The <b>FCID</b> is the address, given by the fabric when the device logs in, and used to route every frame.</p>

<h3>World Wide Names: WWNN and WWPN</h3>
<p>A WWN is 8 bytes, written as 16 hex digits in pairs, for example <code>20:00:00:25:b5:aa:00:01</code>.</p>
<ul>
<li><b>WWNN</b> (world wide node name) identifies the whole device: one HBA card, or one storage array.</li>
<li><b>WWPN</b> (world wide port name) identifies one port on that device. A dual-port HBA has one WWNN and two WWPNs. An array with eight front-end ports has one WWNN and eight WWPNs.</li>
</ul>
<p><b>You zone and mask on WWPNs</b>, because traffic flows port to port. The first digit is the NAA format: WWNs starting with <code>1</code> or <code>2</code> are typical of HBAs (the next bytes often contain the vendor's OUI; <code>00:25:b5</code> is Cisco, used in UCS WWPN pools), and WWNs starting with <code>5</code> are typical of arrays (for example ARRAY1 spa0 = <code>50:06:01:60:3e:a0:12:34</code>). In Cisco UCS the WWPNs are virtual, taken from pools in the service profile, so replacing a blade or an adapter does not change them.</p>

<h3>The FCID: domain, area, port</h3>
<p>The FCID is 24 bits, written as 6 hex digits: <b>domain . area . port</b>, one byte each.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="FCID structure">
<rect x="80" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="160" y="50" text-anchor="middle" class="svg-ink" font-size="16">0a</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="16">00</text>
<rect x="400" y="20" width="160" height="50" rx="8" fill="#fde68a"/><text x="480" y="50" text-anchor="middle" class="svg-ink" font-size="16">20</text>
<text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="13">Domain ID (switch)</text><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Area</text><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">Port</text>
<text x="160" y="118" text-anchor="middle" class="svg-muted" font-size="12">MDS-A = 0x0a</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">assigned by switch</text><text x="480" y="118" text-anchor="middle" class="svg-muted" font-size="12">assigned by switch</text>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="13">FCID 0x0a0020 = ARRAY1 spa0 on MDS-A</text>
</svg><p class="cap">The first byte always tells you which switch the device is logged in to.</p></div>
<p>Each switch in a VSAN has a unique <b>domain ID</b> from 1 to 239 (0x01 to 0xEF). Domain IDs are handed out by the <b>principal switch</b>, elected per VSAN (lowest priority value wins, default 128, then lowest switch WWN). Best practice is to configure <b>static domain IDs</b> so they never change after a fabric rebuild, and to keep <b>persistent FCIDs</b> (enabled by default on MDS) so a device gets the same FCID every time. Some operating systems bind disks to the FCID, so a changing FCID can make them lose their disks.</p>
<pre class="code"><span class="c">! fabric A: pin MDS-A to domain 10 (0x0a) in VSAN 10</span>
fcdomain domain 10 static vsan 10
fcdomain fcid persistent vsan 10</pre>
<p>Addresses at the top of the range are <b>well-known addresses</b> for fabric services: <code>0xFFFFFE</code> is the fabric login server, <code>0xFFFFFC</code> is the directory (name) server, <code>0xFFFFFD</code> is the fabric controller that sends state-change notifications.</p>

<h3>Port types</h3>
<table class="cmp"><tr><th>Port</th><th>Where</th><th>Meaning</th></tr>
<tr><td><b>N_Port</b></td><td>Host HBA, array port</td><td>Node port: an end device</td></tr>
<tr><td><b>F_Port</b></td><td>Switch port facing an N_Port</td><td>Fabric port: accepts FLOGI</td></tr>
<tr><td><b>E_Port</b></td><td>Switch to switch (ISL)</td><td>Expansion port: carries one VSAN</td></tr>
<tr><td><b>TE_Port</b></td><td>Switch to switch, Cisco</td><td>Trunking E_Port: carries several VSANs with a VSAN tag (EISL)</td></tr>
<tr><td><b>NP_Port</b></td><td>NPV edge uplink to the core</td><td>Proxy N_Port: logs its servers in to the core (chapter 9)</td></tr>
<tr><td><b>TF / TNP</b></td><td>Core F_Port / NPV uplink</td><td>The trunking versions of F and NP</td></tr>
</table>
<p>On MDS the default admin mode is <code>auto</code>, which becomes F, E or TE depending on what is connected. In production you set the mode explicitly: <code>switchport mode F</code> for host and array ports.</p>

<h3>The login sequence</h3>
<ol>
<li><b>FLOGI</b> (fabric login). The N_Port sends FLOGI to 0xFFFFFE with its WWPN, WWNN and credits. The switch replies ACC with the new <b>FCID</b>. The port is now "in the fabric".</li>
<li><b>Name server registration.</b> The port does a PLOGI to the name server (0xFFFFFC) and registers its FC-4 type and features: a host registers as <code>scsi-fcp:init</code>, an array port as <code>scsi-fcp:target</code>. It also registers for state change notifications (SCR), so it receives an <b>RSCN</b> whenever devices join or leave its zones.</li>
<li><b>Query.</b> The initiator asks the name server "which SCSI targets can I see?". The answer is filtered by <b>zoning</b>: only targets in a common active zone are returned.</li>
<li><b>PLOGI</b> (port login) from the initiator to each target it learned about, exchanging service parameters.</li>
<li><b>PRLI</b> (process login) establishes the FC-4 session: now SCSI (FCP) can run. The host sends REPORT LUNS and discovers what the array's masking allows.</li>
</ol>

<h3>What you see on the MDS</h3>
<pre class="out">MDS-A# show flogi database
--------------------------------------------------------------------------------
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
--------------------------------------------------------------------------------
fc1/1            10      0x0a0000       20:00:00:25:b5:aa:00:01 20:00:00:25:b5:00:00:01
                                        [ESX01-HBA1]
<span class="hl">fc1/5            10      0x0a0020       50:06:01:60:3e:a0:12:34 50:06:01:60:be:a0:12:34</span>
                                        [ARRAY1-SPA0]

Total number of flogi = 2.

MDS-A# show fcns database vsan 10

VSAN 10:
--------------------------------------------------------------------------
FCID        TYPE  PWWN                    (VENDOR)        FC4-TYPE:FEATURE
--------------------------------------------------------------------------
0x0a0000    N     20:00:00:25:b5:aa:00:01 (Cisco)         scsi-fcp:init fc-gs
0x0a0020    N     50:06:01:60:3e:a0:12:34                 scsi-fcp:target

Total number of entries = 2</pre>
<div class="eg"><p><b>Worked example: reading an FCID.</b> In lab 1 you are asked which FCID the array port received. Read the fc1/5 row: <code>0x0a0020</code>. Split it: domain <code>0a</code> = 10 decimal, which is MDS-A's domain; area <code>00</code>; port <code>20</code>. A device on MDS-B would start with <code>14</code>, because 0x14 = 20 decimal. <code>show flogi database</code> is local to the switch the device is plugged into; <code>show fcns database</code> is fabric-wide for the VSAN, so on a multi-switch fabric it lists devices on every switch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Zoning on the WWNN instead of the WWPN. Assuming FLOGI means "the host can see its disks": FLOGI only proves the link, the port and the VSAN; name server registration, zoning, PLOGI/PRLI and masking still follow. Copying a WWPN with one wrong digit into a zone; always paste from <code>show flogi database</code>.</p></div>
<div class="exam"><p><b>Exam tip.</b> FLOGI = N_Port to fabric (0xFFFFFE), gets the FCID. PLOGI = port to port (or to the name server 0xFFFFFC). PRLI = FC-4 process login. FCID = domain.area.port; domain IDs 1 to 239 per VSAN; the principal switch assigns them.</p></div>

<div class="scn"><h4>The replaced HBA</h4><p>A rack server (not UCS) had a failed HBA replaced overnight. In the morning it booted without its data disks. <code>show flogi database</code> showed the port up and logged in, in the right VSAN, but with a WWPN nobody recognised. The zone and the array masking both referenced the old card's WWPN. The engineer updated the device alias to point to the new WWPN (so every zone using the alias followed), reactivated the zoneset, and the storage team updated the initiator on the array. The team then moved the rack servers to adapters that support a configurable WWPN, like the UCS servers already had.</p><p><b>Lesson:</b> WWPNs are the identity everything is built on; when hardware changes, the identity changes, unless it is virtualised.</p></div>

<div class="iv"><p class="q">"Explain FLOGI, PLOGI and PRLI, and what show flogi database versus show fcns database tells you."</p><p>Strong answer: FLOGI is the N_Port logging in to the fabric at 0xFFFFFE and receiving its FCID; then the device registers with the name server; PLOGI is port-to-port login (initiator to target, and also to the name server); PRLI establishes the upper-layer session such as SCSI-FCP. <code>show flogi database</code> shows logins on the local switch per interface and VSAN; <code>show fcns database</code> shows the VSAN-wide name server with FC-4 types, so you can check that the host is an initiator and the array a target. Add that FLOGI alone does not prove storage access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WWNN names the device, WWPN names each port; zone and mask on WWPNs.</li>
<li>The FCID (domain.area.port) is assigned at FLOGI; the first byte is the switch's domain ID (1 to 239 per VSAN).</li>
<li>Configure static domain IDs and keep persistent FCIDs for stable addressing.</li>
<li>Port types: N, F, E, TE, NP (plus TF/TNP for trunking); set F mode explicitly on host and array ports.</li>
<li>Login order: FLOGI, name server registration, zoned query, PLOGI, PRLI, then LUN discovery.</li>
</ul></div>
`,hi:`
<p>Desh mein har insaan ka ek permanent identity number hota hai jo kabhi nahi badalta, aur ek postal address jo is par depend karta hai ki woh abhi kahan rehta hai. Fibre Channel bilkul yahi idea use karta hai. <b>World Wide Name</b> identity number hai, burnt-in aur permanent. <b>FCID</b> address hai, jo device ke login karne par fabric deta hai, aur har frame ko route karne ke liye use hota hai.</p>

<h3>World Wide Names: WWNN aur WWPN</h3>
<p>WWN 8 bytes ka hota hai, pairs mein 16 hex digits ki tarah likha jaata hai, jaise <code>20:00:00:25:b5:aa:00:01</code>.</p>
<ul>
<li><b>WWNN</b> (world wide node name) poore device ko pehchanta hai: ek HBA card, ya ek storage array.</li>
<li><b>WWPN</b> (world wide port name) us device ke ek port ko pehchanta hai. Dual-port HBA ka ek WWNN aur do WWPNs hote hain. Aath front-end ports wale array ka ek WWNN aur aath WWPNs hote hain.</li>
</ul>
<p><b>Zoning aur masking WWPNs par hoti hai</b>, kyunki traffic port se port chalta hai. Pehla digit NAA format hai: <code>1</code> ya <code>2</code> se shuru hone wale WWNs HBAs ke typical hain (agle bytes mein aksar vendor ka OUI hota hai; <code>00:25:b5</code> Cisco hai, jo UCS WWPN pools mein use hota hai), aur <code>5</code> se shuru hone wale WWNs arrays ke typical hain (jaise ARRAY1 spa0 = <code>50:06:01:60:3e:a0:12:34</code>). Cisco UCS mein WWPNs virtual hote hain, service profile ke pools se liye jaate hain, isliye blade ya adapter badalne se woh nahi badalte.</p>

<h3>FCID: domain, area, port</h3>
<p>FCID 24 bits ka hai, 6 hex digits mein likha jaata hai: <b>domain . area . port</b>, har ek ek byte.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="FCID ka structure">
<rect x="80" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="160" y="50" text-anchor="middle" class="svg-ink" font-size="16">0a</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="16">00</text>
<rect x="400" y="20" width="160" height="50" rx="8" fill="#fde68a"/><text x="480" y="50" text-anchor="middle" class="svg-ink" font-size="16">20</text>
<text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="13">Domain ID (switch)</text><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Area</text><text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="13">Port</text>
<text x="160" y="118" text-anchor="middle" class="svg-muted" font-size="12">MDS-A = 0x0a</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">switch assign karta hai</text><text x="480" y="118" text-anchor="middle" class="svg-muted" font-size="12">switch assign karta hai</text>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="13">FCID 0x0a0020 = MDS-A par ARRAY1 spa0</text>
</svg><p class="cap">Pehla byte hamesha batata hai ki device kis switch par logged in hai.</p></div>
<p>VSAN mein har switch ka 1 se 239 (0x01 se 0xEF) tak ek unique <b>domain ID</b> hota hai. Domain IDs <b>principal switch</b> baant-ta hai, jo har VSAN mein elect hota hai (sabse kam priority value jeet-ti hai, default 128, phir sabse kam switch WWN). Best practice hai <b>static domain IDs</b> configure karna taaki fabric rebuild ke baad woh kabhi na badlein, aur <b>persistent FCIDs</b> rakhna (MDS par default enabled) taaki device ko har baar same FCID mile. Kuch operating systems disks ko FCID se bind karte hain, isliye badalta FCID unki disks gayab kar sakta hai.</p>
<pre class="code"><span class="c">! fabric A: MDS-A ko VSAN 10 mein domain 10 (0x0a) par pin karo</span>
fcdomain domain 10 static vsan 10
fcdomain fcid persistent vsan 10</pre>
<p>Range ke top wale addresses fabric services ke <b>well-known addresses</b> hain: <code>0xFFFFFE</code> fabric login server hai, <code>0xFFFFFC</code> directory (name) server hai, <code>0xFFFFFD</code> fabric controller hai jo state-change notifications bhejta hai.</p>

<h3>Port types</h3>
<table class="cmp"><tr><th>Port</th><th>Kahan</th><th>Matlab</th></tr>
<tr><td><b>N_Port</b></td><td>Host HBA, array port</td><td>Node port: ek end device</td></tr>
<tr><td><b>F_Port</b></td><td>N_Port ki taraf wala switch port</td><td>Fabric port: FLOGI accept karta hai</td></tr>
<tr><td><b>E_Port</b></td><td>Switch se switch (ISL)</td><td>Expansion port: ek VSAN le jaata hai</td></tr>
<tr><td><b>TE_Port</b></td><td>Switch se switch, Cisco</td><td>Trunking E_Port: VSAN tag (EISL) ke saath kai VSANs le jaata hai</td></tr>
<tr><td><b>NP_Port</b></td><td>Core tak NPV edge uplink</td><td>Proxy N_Port: apne servers ko core mein login karata hai (chapter 9)</td></tr>
<tr><td><b>TF / TNP</b></td><td>Core F_Port / NPV uplink</td><td>F aur NP ke trunking versions</td></tr>
</table>
<p>MDS par default admin mode <code>auto</code> hai, jo is par depend karke F, E ya TE ban jaata hai ki kya juda hai. Production mein aap mode explicitly set karte ho: host aur array ports ke liye <code>switchport mode F</code>.</p>

<h3>Login sequence</h3>
<ol>
<li><b>FLOGI</b> (fabric login). N_Port apne WWPN, WWNN aur credits ke saath 0xFFFFFE ko FLOGI bhejta hai. Switch naye <b>FCID</b> ke saath ACC reply karta hai. Port ab "fabric mein" hai.</li>
<li><b>Name server registration.</b> Port name server (0xFFFFFC) ko PLOGI karta hai aur apna FC-4 type aur features register karta hai: host <code>scsi-fcp:init</code> ki tarah register hota hai, array port <code>scsi-fcp:target</code> ki tarah. Woh state change notifications ke liye bhi register karta hai (SCR), taaki jab bhi devices uski zones mein judein ya niklein use <b>RSCN</b> mile.</li>
<li><b>Query.</b> Initiator name server se poochta hai "main kaunse SCSI targets dekh sakta hoon?". Jawab <b>zoning</b> se filter hota hai: sirf common active zone wale targets lautaye jaate hain.</li>
<li><b>PLOGI</b> (port login) initiator se har us target tak jiske baare mein usne seekha, service parameters exchange karte hue.</li>
<li><b>PRLI</b> (process login) FC-4 session banata hai: ab SCSI (FCP) chal sakta hai. Host REPORT LUNS bhejta hai aur discover karta hai ki array ki masking kya allow karti hai.</li>
</ol>

<h3>MDS par aapko kya dikhta hai</h3>
<pre class="out">MDS-A# show flogi database
--------------------------------------------------------------------------------
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
--------------------------------------------------------------------------------
fc1/1            10      0x0a0000       20:00:00:25:b5:aa:00:01 20:00:00:25:b5:00:00:01
                                        [ESX01-HBA1]
<span class="hl">fc1/5            10      0x0a0020       50:06:01:60:3e:a0:12:34 50:06:01:60:be:a0:12:34</span>
                                        [ARRAY1-SPA0]

Total number of flogi = 2.

MDS-A# show fcns database vsan 10

VSAN 10:
--------------------------------------------------------------------------
FCID        TYPE  PWWN                    (VENDOR)        FC4-TYPE:FEATURE
--------------------------------------------------------------------------
0x0a0000    N     20:00:00:25:b5:aa:00:01 (Cisco)         scsi-fcp:init fc-gs
0x0a0020    N     50:06:01:60:3e:a0:12:34                 scsi-fcp:target

Total number of entries = 2</pre>
<div class="eg"><p><b>Worked example: FCID padhna.</b> Lab 1 mein aapse poocha jaata hai ki array port ko kaunsa FCID mila. fc1/5 wali row padho: <code>0x0a0020</code>. Ise todo: domain <code>0a</code> = 10 decimal, jo MDS-A ka domain hai; area <code>00</code>; port <code>20</code>. MDS-B par ka device <code>14</code> se shuru hoga, kyunki 0x14 = 20 decimal. <code>show flogi database</code> us switch ka local hai jismein device plugged hai; <code>show fcns database</code> VSAN ke liye fabric-wide hai, isliye multi-switch fabric par yeh har switch ke devices dikhata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> WWPN ki jagah WWNN par zoning karna. Yeh maan lena ki FLOGI ka matlab "host apni disks dekh sakta hai": FLOGI sirf link, port aur VSAN prove karta hai; name server registration, zoning, PLOGI/PRLI aur masking abhi baaki hain. Ek galat digit wala WWPN zone mein copy karna; hamesha <code>show flogi database</code> se paste karo.</p></div>
<div class="exam"><p><b>Exam tip.</b> FLOGI = N_Port se fabric (0xFFFFFE), FCID milta hai. PLOGI = port se port (ya name server 0xFFFFFC tak). PRLI = FC-4 process login. FCID = domain.area.port; har VSAN mein domain IDs 1 se 239; principal switch unhe assign karta hai.</p></div>

<div class="scn"><h4>Badla hua HBA</h4><p>Ek rack server (UCS nahi) ka fail hua HBA raat mein badla gaya. Subah woh apni data disks ke bina boot hua. <code>show flogi database</code> mein port up aur logged in tha, sahi VSAN mein, lekin ek aise WWPN ke saath jise koi pehchanta nahi tha. Zone aur array masking dono purane card ke WWPN ko reference kar rahe the. Engineer ne device alias ko naye WWPN par point kiya (taaki alias use karne wali har zone saath chale), zoneset reactivate kiya, aur storage team ne array par initiator update kiya. Phir team ne rack servers ko aise adapters par shift kiya jo configurable WWPN support karte hain, jaisa UCS servers mein pehle se tha.</p><p><b>Seekh:</b> WWPNs woh identity hain jis par sab kuch bana hai; hardware badle to identity badalti hai, jab tak woh virtualised na ho.</p></div>

<div class="iv"><p class="q">"FLOGI, PLOGI aur PRLI samjhao, aur show flogi database vs show fcns database kya batata hai."</p><p>Strong answer: FLOGI N_Port ka 0xFFFFFE par fabric mein login karna aur apna FCID lena hai; phir device name server mein register hota hai; PLOGI port-to-port login hai (initiator se target, aur name server tak bhi); PRLI SCSI-FCP jaisa upper-layer session banata hai. <code>show flogi database</code> local switch ke logins har interface aur VSAN ke hisaab se dikhata hai; <code>show fcns database</code> FC-4 types ke saath VSAN-wide name server dikhata hai, jisse aap check kar sakte ho ki host initiator hai aur array target. Yeh bhi jodo ki sirf FLOGI storage access prove nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WWNN device ka naam hai, WWPN har port ka; zoning aur masking WWPNs par karo.</li>
<li>FCID (domain.area.port) FLOGI par assign hota hai; pehla byte switch ka domain ID hai (har VSAN mein 1 se 239).</li>
<li>Stable addressing ke liye static domain IDs configure karo aur persistent FCIDs rakho.</li>
<li>Port types: N, F, E, TE, NP (plus trunking ke liye TF/TNP); host aur array ports par F mode explicitly set karo.</li>
<li>Login order: FLOGI, name server registration, zoned query, PLOGI, PRLI, phir LUN discovery.</li>
</ul></div>
`}};export{e as default};