var e={id:`mds-change`,h:{en:`A complete MDS zoning change, end to end, with LUN masking and proof`,hi:`Ek poora MDS zoning change, end to end, LUN masking aur proof ke saath`},body:{en:`
<p>A pilot does not take off because the engine started. There is a checklist before, during and after every flight, and each item is confirmed out loud. A SAN change is the same: the commands are short, but the checklist around them is what keeps hundreds of servers safe. In this chapter we run one real change from ticket to proof.</p>

<h3>The change request</h3>
<p><b>CHG-2231:</b> "Add new host ESX03 to fabric A. ESX03 vmhba1 (WWPN 20:00:00:25:b5:aa:00:03) is cabled to MDS-A fc1/3. Give it LUN 2 (DS-ESX03, 1000 GB) on ARRAY1. VSAN 10 runs <b>enhanced zoning</b>. ESX01 is in production and must not be affected." (In a real site the same change is then repeated on fabric B for ESX03's second HBA.)</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change workflow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Pre-check</text><text x="65" y="85" text-anchor="middle" class="svg-muted" font-size="12">FLOGI, status</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Aliases</text><text x="190" y="85" text-anchor="middle" class="svg-muted" font-size="12">+ commit</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Zone</text><text x="315" y="85" text-anchor="middle" class="svg-muted" font-size="12">zoneset, activate</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Commit</text><text x="440" y="85" text-anchor="middle" class="svg-muted" font-size="12">diff first</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Mask + rescan</text><text x="570" y="85" text-anchor="middle" class="svg-muted" font-size="12">array, host</text>
<line x1="120" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="245" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="495" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="13">6 Verify, save, then repeat on fabric B</text>
</svg><p class="cap">Every step has a verification command. You never move to the next step on an assumption.</p></div>

<h3>Step 1: pre-checks</h3>
<pre class="out">MDS-A# show flogi database interface fc1/3
--------------------------------------------------------------------------------
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
--------------------------------------------------------------------------------
<span class="hl">fc1/3            10      0x0a0040       20:00:00:25:b5:aa:00:03 20:00:00:25:b5:00:00:03</span>

MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
    mode: enhanced merge-control: allow
    session: none
    hard-zoning: enabled broadcast: unsupported</pre>
<p>Three facts confirmed: the HBA is logged in, it is in VSAN 10, and nobody holds the zoning lock. Also save a copy of the current state so you can compare or roll back: <code>show zoneset active vsan 10 &gt; bootflash:zs-before-chg2231.txt</code> and <code>copy running-config bootflash:pre-chg2231.cfg</code>.</p>

<h3>Step 2: device alias</h3>
<pre class="code">MDS-A# configure terminal
MDS-A(config)# device-alias database
MDS-A(config-device-alias-db)# device-alias name ESX03-HBA1 pwwn 20:00:00:25:b5:aa:00:03
MDS-A(config-device-alias-db)# exit
MDS-A(config)# device-alias commit</pre>
<p>ARRAY1-SPA0 already exists. Check with <code>show device-alias name ESX03-HBA1</code>; if it is missing, the commit did not happen.</p>

<h3>Step 3: zone, zoneset membership, activation</h3>
<pre class="code"><span class="c">! first zoning command opens the enhanced session (fabric lock)</span>
MDS-A(config)# zone name ESX03_ARRAY1 vsan 10
MDS-A(config-zone)# member device-alias ESX03-HBA1
MDS-A(config-zone)# member device-alias ARRAY1-SPA0
MDS-A(config-zone)# zoneset name ZS-FABRIC-A vsan 10
MDS-A(config-zoneset)# member ESX03_ARRAY1
MDS-A(config-zoneset)# zoneset activate name ZS-FABRIC-A vsan 10
Zoneset activation initiated. check zone status</pre>
<p>In enhanced mode this activation is <b>pending</b>. Nothing is enforced yet.</p>

<h3>Step 4: read the diff, then commit</h3>
<pre class="out">MDS-A(config)# show zone pending-diff vsan 10
VSAN: 10
+zone name ESX03_ARRAY1 vsan 10
+    device-alias ESX03-HBA1
+    device-alias ARRAY1-SPA0
 zoneset name ZS-FABRIC-A vsan 10
+    zone name ESX03_ARRAY1
Pending activation: zoneset ZS-FABRIC-A vsan 10 (takes effect on 'zone commit vsan 10')</pre>
<p>The diff must contain <b>only</b> your change: plus signs for the new zone and its zoneset membership, and no minus signs on ESX01's zone. If you see anything unexpected (someone else's leftover edits), stop and discard with <code>no zone commit vsan 10</code>. If it is clean:</p>
<pre class="code">MDS-A(config)# zone commit vsan 10
Commit operation initiated. Check zone status
MDS-A(config)# end</pre>

<h3>Step 5: verify the fabric</h3>
<pre class="out">MDS-A# show zone status vsan 10 | include session
<span class="hl">    session: none</span>
MDS-A# show zoneset active vsan 10
zoneset name ZS-FABRIC-A vsan 10
  zone name ESX01_ARRAY1 vsan 10
  * fcid 0x0a0000 [device-alias ESX01-HBA1]
  * fcid 0x0a0020 [device-alias ARRAY1-SPA0]

  zone name ESX03_ARRAY1 vsan 10
<span class="hl">  * fcid 0x0a0040 [device-alias ESX03-HBA1]</span>
  * fcid 0x0a0020 [device-alias ARRAY1-SPA0]

MDS-A# show zone member pwwn 20:00:00:25:b5:aa:00:03 vsan 10
                            VSAN: 10
zone ESX03_ARRAY1</pre>
<p>The <b>*</b> in front of a member means that member is <b>logged in</b> right now and the line shows its FCID. A member without a star is zoned but not online, or the WWPN in the zone does not match any logged-in port (typo).</p>

<h3>Step 6: LUN masking on the array</h3>
<p>Zoning lets ESX03 reach the array port; the array still decides which LUNs it may see. On most arrays you create a <b>host</b> (or initiator group) object containing the host's WWPNs, and map LUNs to it, often with a <b>host LUN ID</b>. Keep the host LUN ID the same on every host of a cluster, so each datastore has the same LUN number everywhere. In the lab ARRAY1 has a direct form:</p>
<pre class="code">ARRAY1&gt; show initiators
ARRAY1&gt; lun mask 2 initiator 20:00:00:25:b5:aa:00:03
ARRAY1&gt; show masking</pre>
<pre class="out">LUN  Name              Initiator WWPN            Logged in now
---  ----------------  -----------------------   -------------
0    DS-ESX01          20:00:00:25:b5:aa:00:01   yes (spa0)
<span class="hl">2    DS-ESX03          20:00:00:25:b5:aa:00:03   yes (spa0)</span></pre>

<h3>Step 7: prove it on the host, then save</h3>
<pre class="code">[root@esx03:~] esxcli storage core adapter rescan --all
[root@esx03:~] esxcli storage core path list</pre>
<p>ESX03 must show LUN 2 with an active path, and ESX01 must still show LUN 0. Finally <code>copy running-config startup-config</code> on MDS-A. The commit changed the running configuration; without saving, a reload would lose the zone.</p>

<div class="eg"><p><b>Worked example: how long does it take?</b> Pre-checks 5 minutes, aliases and zone 5 minutes, diff review and commit 2 minutes, array masking 5 minutes, host rescan and path check 3 minutes: about 20 minutes per fabric, 40 minutes for both. Book a 60-minute window so that there is time to roll back calmly if a check fails.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Closing the change after <code>zoneset activate</code> in enhanced mode, without <code>zone commit</code>: nothing happened and the fabric stays locked. Committing without reading the diff and pushing someone else's half-finished edits. Masking only one of the host's HBAs. Forgetting <code>copy running-config startup-config</code>.</p></div>
<div class="exam"><p><b>Exam tip.</b> <code>show zone pending-diff vsan N</code> shows what a commit would change; <code>show zone status vsan N</code> shows the mode and whether a session is open; <code>*</code> in <code>show zoneset active</code> marks logged-in members.</p></div>

<div class="scn"><h4>The change that was "done" last night</h4><p>INC-5120: CHG-2231 was closed as successful, but ESX03 had no datastore and the SAN team said the VSAN 10 zoning database had looked locked since the night before. <code>show zone status vsan 10</code> showed <b>mode: enhanced</b> and <b>session: cli [admin]</b>; <code>show zone pending-diff</code> showed exactly the planned ESX03 zone and a pending activation. The night engineer had typed everything and logged off without committing. The on-call engineer committed, confirmed the new zone with a * in the active zoneset, then found that the array had never masked LUN 2 either. After masking and a rescan, ESX03 saw its 1000 GB LUN, and MDS-A was saved.</p><p><b>Lesson:</b> in enhanced mode, "configured" is not "done"; done means committed, verified on the host, and saved.</p></div>

<div class="iv"><p class="q">"Take me through how you would add a new host to a production fabric safely."</p><p>Strong answer: a structured change. Pre-checks: FLOGI in the right VSAN, zoning mode, no open session, backup of the active zoneset. Create and commit the device alias, create a single-initiator zone, add it to the existing active zoneset (never activate a different one), activate, read <code>show zone pending-diff</code>, commit. Verify with <code>show zoneset active</code> (both members starred) and <code>show zone status</code> (session none). Mask the LUN on the array, rescan the host, confirm paths, confirm existing hosts unaffected, save, and repeat on fabric B.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pre-check FLOGI, VSAN, zoning mode and open sessions before changing anything.</li>
<li>Add new zones to the existing active zoneset and reactivate that same zoneset.</li>
<li>In enhanced mode, read <code>show zone pending-diff</code>, then <code>zone commit</code>; confirm <code>session: none</code>.</li>
<li>Stars in <code>show zoneset active</code> prove members are logged in; then mask the LUN on the array.</li>
<li>Prove the result on the host, check other hosts are untouched, save the config, and repeat on fabric B.</li>
</ul></div>
`,hi:`
<p>Pilot sirf isliye take off nahi karta ki engine start ho gaya. Har flight se pehle, dauraan aur baad ek checklist hoti hai, aur har item zor se confirm kiya jaata hai. SAN change bhi aisa hi hai: commands chhote hain, lekin unke aas-paas ki checklist hi sainkdon servers ko safe rakhti hai. Is chapter mein hum ek real change ko ticket se proof tak chalayenge.</p>

<h3>Change request</h3>
<p><b>CHG-2231:</b> "Naye host ESX03 ko fabric A mein jodo. ESX03 vmhba1 (WWPN 20:00:00:25:b5:aa:00:03) MDS-A fc1/3 se cabled hai. Use ARRAY1 par LUN 2 (DS-ESX03, 1000 GB) do. VSAN 10 <b>enhanced zoning</b> chalata hai. ESX01 production mein hai aur affect nahi hona chahiye." (Real site mein yahi change phir ESX03 ke doosre HBA ke liye fabric B par repeat hota hai.)</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change workflow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Pre-check</text><text x="65" y="85" text-anchor="middle" class="svg-muted" font-size="12">FLOGI, status</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Aliases</text><text x="190" y="85" text-anchor="middle" class="svg-muted" font-size="12">+ commit</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Zone</text><text x="315" y="85" text-anchor="middle" class="svg-muted" font-size="12">zoneset, activate</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Commit</text><text x="440" y="85" text-anchor="middle" class="svg-muted" font-size="12">pehle diff</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Mask + rescan</text><text x="570" y="85" text-anchor="middle" class="svg-muted" font-size="12">array, host</text>
<line x1="120" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="245" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="495" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="13">6 Verify, save, phir fabric B par repeat</text>
</svg><p class="cap">Har step ka ek verification command hai. Aap kisi assumption par agle step par nahi jaate.</p></div>

<h3>Step 1: pre-checks</h3>
<pre class="out">MDS-A# show flogi database interface fc1/3
--------------------------------------------------------------------------------
INTERFACE        VSAN    FCID           PORT NAME               NODE NAME
--------------------------------------------------------------------------------
<span class="hl">fc1/3            10      0x0a0040       20:00:00:25:b5:aa:00:03 20:00:00:25:b5:00:00:03</span>

MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
    mode: enhanced merge-control: allow
    session: none
    hard-zoning: enabled broadcast: unsupported</pre>
<p>Teen facts confirm hue: HBA logged in hai, VSAN 10 mein hai, aur kisi ke paas zoning lock nahi hai. Current state ki copy bhi save karo taaki compare ya roll back kar sako: <code>show zoneset active vsan 10 &gt; bootflash:zs-before-chg2231.txt</code> aur <code>copy running-config bootflash:pre-chg2231.cfg</code>.</p>

<h3>Step 2: device alias</h3>
<pre class="code">MDS-A# configure terminal
MDS-A(config)# device-alias database
MDS-A(config-device-alias-db)# device-alias name ESX03-HBA1 pwwn 20:00:00:25:b5:aa:00:03
MDS-A(config-device-alias-db)# exit
MDS-A(config)# device-alias commit</pre>
<p>ARRAY1-SPA0 pehle se exist karta hai. <code>show device-alias name ESX03-HBA1</code> se check karo; agar yeh missing hai, to commit nahi hua.</p>

<h3>Step 3: zone, zoneset membership, activation</h3>
<pre class="code"><span class="c">! pehla zoning command enhanced session kholta hai (fabric lock)</span>
MDS-A(config)# zone name ESX03_ARRAY1 vsan 10
MDS-A(config-zone)# member device-alias ESX03-HBA1
MDS-A(config-zone)# member device-alias ARRAY1-SPA0
MDS-A(config-zone)# zoneset name ZS-FABRIC-A vsan 10
MDS-A(config-zoneset)# member ESX03_ARRAY1
MDS-A(config-zoneset)# zoneset activate name ZS-FABRIC-A vsan 10
Zoneset activation initiated. check zone status</pre>
<p>Enhanced mode mein yeh activation <b>pending</b> hai. Abhi kuch enforce nahi hua.</p>

<h3>Step 4: diff padho, phir commit karo</h3>
<pre class="out">MDS-A(config)# show zone pending-diff vsan 10
VSAN: 10
+zone name ESX03_ARRAY1 vsan 10
+    device-alias ESX03-HBA1
+    device-alias ARRAY1-SPA0
 zoneset name ZS-FABRIC-A vsan 10
+    zone name ESX03_ARRAY1
Pending activation: zoneset ZS-FABRIC-A vsan 10 (takes effect on 'zone commit vsan 10')</pre>
<p>Diff mein <b>sirf</b> aapka change hona chahiye: nayi zone aur uski zoneset membership ke liye plus signs, aur ESX01 ki zone par koi minus sign nahi. Agar kuch unexpected dikhe (kisi aur ke bache hue edits), ruko aur <code>no zone commit vsan 10</code> se discard karo. Agar clean hai:</p>
<pre class="code">MDS-A(config)# zone commit vsan 10
Commit operation initiated. Check zone status
MDS-A(config)# end</pre>

<h3>Step 5: fabric verify karo</h3>
<pre class="out">MDS-A# show zone status vsan 10 | include session
<span class="hl">    session: none</span>
MDS-A# show zoneset active vsan 10
zoneset name ZS-FABRIC-A vsan 10
  zone name ESX01_ARRAY1 vsan 10
  * fcid 0x0a0000 [device-alias ESX01-HBA1]
  * fcid 0x0a0020 [device-alias ARRAY1-SPA0]

  zone name ESX03_ARRAY1 vsan 10
<span class="hl">  * fcid 0x0a0040 [device-alias ESX03-HBA1]</span>
  * fcid 0x0a0020 [device-alias ARRAY1-SPA0]

MDS-A# show zone member pwwn 20:00:00:25:b5:aa:00:03 vsan 10
                            VSAN: 10
zone ESX03_ARRAY1</pre>
<p>Member ke aage <b>*</b> ka matlab hai woh member abhi <b>logged in</b> hai aur line uska FCID dikhati hai. Bina star wala member zoned hai lekin online nahi, ya zone ka WWPN kisi logged-in port se match nahi karta (typo).</p>

<h3>Step 6: array par LUN masking</h3>
<p>Zoning ESX03 ko array port tak pahunchne deti hai; array abhi bhi tay karta hai ki woh kaunse LUNs dekh sakta hai. Zyada tar arrays par aap host ke WWPNs wala ek <b>host</b> (ya initiator group) object banate ho, aur LUNs usse map karte ho, aksar ek <b>host LUN ID</b> ke saath. Cluster ke har host par host LUN ID same rakho, taaki har datastore ka har jagah same LUN number ho. Lab mein ARRAY1 ka direct form hai:</p>
<pre class="code">ARRAY1&gt; show initiators
ARRAY1&gt; lun mask 2 initiator 20:00:00:25:b5:aa:00:03
ARRAY1&gt; show masking</pre>
<pre class="out">LUN  Name              Initiator WWPN            Logged in now
---  ----------------  -----------------------   -------------
0    DS-ESX01          20:00:00:25:b5:aa:00:01   yes (spa0)
<span class="hl">2    DS-ESX03          20:00:00:25:b5:aa:00:03   yes (spa0)</span></pre>

<h3>Step 7: host par prove karo, phir save karo</h3>
<pre class="code">[root@esx03:~] esxcli storage core adapter rescan --all
[root@esx03:~] esxcli storage core path list</pre>
<p>ESX03 ko active path ke saath LUN 2 dikhna chahiye, aur ESX01 ko ab bhi LUN 0 dikhna chahiye. Aakhir mein MDS-A par <code>copy running-config startup-config</code>. Commit ne running configuration badli; save kiye bina reload zone kho dega.</p>

<div class="eg"><p><b>Worked example: kitna time lagta hai?</b> Pre-checks 5 minute, aliases aur zone 5 minute, diff review aur commit 2 minute, array masking 5 minute, host rescan aur path check 3 minute: har fabric ke liye lagbhag 20 minute, dono ke liye 40 minute. 60 minute ki window book karo taaki agar koi check fail ho to aaram se roll back karne ka time ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Enhanced mode mein <code>zoneset activate</code> ke baad, bina <code>zone commit</code> ke change close kar dena: kuch nahi hua aur fabric locked reh gaya. Diff padhe bina commit karna aur kisi aur ke adhoore edits push kar dena. Host ke sirf ek HBA ko mask karna. <code>copy running-config startup-config</code> bhool jaana.</p></div>
<div class="exam"><p><b>Exam tip.</b> <code>show zone pending-diff vsan N</code> dikhata hai ki commit kya badlega; <code>show zone status vsan N</code> mode aur koi khula session dikhata hai; <code>show zoneset active</code> mein <code>*</code> logged-in members ko mark karta hai.</p></div>

<div class="scn"><h4>Woh change jo kal raat "done" hua tha</h4><p>INC-5120: CHG-2231 successful close hua tha, lekin ESX03 ke paas koi datastore nahi tha aur SAN team keh rahi thi ki VSAN 10 ka zoning database pichhli raat se locked lag raha hai. <code>show zone status vsan 10</code> ne <b>mode: enhanced</b> aur <b>session: cli [admin]</b> dikhaya; <code>show zone pending-diff</code> ne bilkul planned ESX03 zone aur ek pending activation dikhaya. Night engineer ne sab type kiya tha aur commit kiye bina log off kar gaya tha. On-call engineer ne commit kiya, active zoneset mein * ke saath nayi zone confirm ki, phir paaya ki array ne bhi LUN 2 kabhi mask nahi kiya tha. Masking aur rescan ke baad ESX03 ko apna 1000 GB LUN dikha, aur MDS-A save kiya gaya.</p><p><b>Seekh:</b> enhanced mode mein "configured" ka matlab "done" nahi hai; done ka matlab committed, host par verified, aur saved.</p></div>

<div class="iv"><p class="q">"Mujhe batao aap production fabric mein naya host safely kaise jodoge."</p><p>Strong answer: ek structured change. Pre-checks: sahi VSAN mein FLOGI, zoning mode, koi khula session nahi, active zoneset ka backup. Device alias banao aur commit karo, single-initiator zone banao, use existing active zoneset mein jodo (kabhi alag zoneset activate mat karo), activate karo, <code>show zone pending-diff</code> padho, commit karo. <code>show zoneset active</code> (dono members starred) aur <code>show zone status</code> (session none) se verify karo. Array par LUN mask karo, host rescan karo, paths confirm karo, existing hosts unaffected confirm karo, save karo, aur fabric B par repeat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kuch bhi badalne se pehle FLOGI, VSAN, zoning mode aur khule sessions pre-check karo.</li>
<li>Nayi zones existing active zoneset mein jodo aur usi zoneset ko reactivate karo.</li>
<li>Enhanced mode mein <code>show zone pending-diff</code> padho, phir <code>zone commit</code>; <code>session: none</code> confirm karo.</li>
<li><code>show zoneset active</code> mein stars prove karte hain ki members logged in hain; phir array par LUN mask karo.</li>
<li>Result host par prove karo, check karo ki doosre hosts untouched hain, config save karo, aur fabric B par repeat karo.</li>
</ul></div>
`}};export{e as default};