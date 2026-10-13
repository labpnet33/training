var e={id:`zoning`,h:{en:`Zoning: members, zones, zonesets, basic vs enhanced mode and device aliases`,hi:`Zoning: members, zones, zonesets, basic vs enhanced mode aur device aliases`},body:{en:`
<p>A VSAN is a building floor. <b>Zoning</b> is the set of locked meeting rooms on that floor. Everyone on the floor is in the same directory, but a person can only enter a room if their name is on that room's list. In Fibre Channel, an initiator can only discover and log in to a target if both are members of the same zone in the <b>active zoneset</b> of the VSAN.</p>

<h3>Why zoning is mandatory</h3>
<ul>
<li><b>Security and data safety.</b> Without zoning every host sees every array port. A Windows server that sees a LUN belonging to a VMware cluster may offer to "initialise" it and destroy the datastore.</li>
<li><b>Stability.</b> When a device joins or leaves, the fabric sends an <b>RSCN</b> (registered state change notification) to devices that share a zone with it. Small zones mean a flapping HBA disturbs only its own targets, not hundreds of hosts.</li>
<li><b>Default deny.</b> On MDS the <b>default zone</b> (devices that are in no active zone) is <b>deny</b> by default. Leave it that way: a new device should see nothing until you zone it deliberately.</li>
</ul>

<h3>Soft and hard zoning</h3>
<p><b>Soft zoning</b> only filters name server replies: a host is not told about targets outside its zones, but if it already knows an FCID it could still send frames to it. <b>Hard zoning</b> enforces the zones in the switch hardware on every frame: frames between devices that are not zoned together are dropped by the port ASIC. Cisco MDS enforces zoning in hardware, so you get both: filtered name server replies and frame-level enforcement.</p>

<h3>Zone member types</h3>
<table class="cmp"><tr><th>Member</th><th>Example</th><th>Follows</th><th>Verdict</th></tr>
<tr><td><b>pwwn</b></td><td><code>member pwwn 20:00:00:25:b5:aa:00:01</code></td><td>The HBA port, wherever it is cabled</td><td>Best practice</td></tr>
<tr><td><b>device-alias</b></td><td><code>member device-alias ESX01-HBA1</code></td><td>The pWWN behind the name</td><td>Best practice, readable</td></tr>
<tr><td><b>fcalias</b></td><td><code>member fcalias ESX01</code></td><td>Members defined in the alias (per VSAN)</td><td>Fine, but VSAN-local</td></tr>
<tr><td><b>fcid</b></td><td><code>member fcid 0x0a0000</code></td><td>The address, which can change</td><td>Avoid</td></tr>
<tr><td><b>interface</b></td><td><code>member interface fc1/7 swwn …</code></td><td>The switch port, whatever is plugged in</td><td>Avoid; breaks on re-cabling</td></tr>
</table>

<h3>Zone design: single initiator, single target</h3>
<p>The recommended pattern is <b>single-initiator, single-target (SIST)</b>: each zone contains one host HBA and one array port. With two array ports per fabric, a host HBA gets two zones. It creates many small zones, but each is safe and easy to read. Large "all hosts with all arrays" zones let initiators see and disturb each other.</p>
<p><b>Smart zoning</b> is the MDS feature that gives you the safety of SIST with fewer zones: you put several members in one zone and tag each as <code>init</code> or <code>target</code>, and the switch only programs initiator-to-target pairs in hardware.</p>
<pre class="code">zone smart-zoning enable vsan 10
zone name CLUSTER1_ARRAY1 vsan 10
  member device-alias ESX01-HBA1 init
  member device-alias ESX02-HBA1 init
  member device-alias ARRAY1-SPA0 target</pre>

<h3>Zone, zoneset, activation</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zone to zoneset to active zoneset">
<rect x="15" y="30" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">Full zone database</text>
<rect x="30" y="65" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="110" y="85" text-anchor="middle" class="svg-ink" font-size="12">zone ESX01_ARRAY1</text>
<rect x="30" y="102" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">zone ESX02_ARRAY1</text>
<rect x="30" y="139" width="160" height="30" rx="6" fill="#bae6fd"/><text x="110" y="159" text-anchor="middle" class="svg-ink" font-size="12">zoneset ZS-FABRIC-A</text>
<line x1="205" y1="105" x2="265" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="265,105 255,100 255,110" fill="#64748b"/>
<rect x="265" y="75" width="130" height="60" rx="8" fill="#fde68a"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="12">zoneset activate</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">(+ zone commit)</text>
<line x1="395" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="440,105 430,100 430,110" fill="#64748b"/>
<rect x="440" y="30" width="185" height="150" rx="8" fill="#ddd6fe"/><text x="532" y="52" text-anchor="middle" class="svg-ink" font-size="13">Active zoneset</text>
<text x="532" y="90" text-anchor="middle" class="svg-ink" font-size="12">enforced in hardware</text><text x="532" y="112" text-anchor="middle" class="svg-muted" font-size="12">one per VSAN</text><text x="532" y="134" text-anchor="middle" class="svg-muted" font-size="12">a copy, not a link</text>
</svg><p class="cap">Editing a zone changes only the full database. Nothing is enforced until the zoneset is activated again (and, in enhanced mode, committed).</p></div>
<ol>
<li>Create zones in the <b>full zone database</b> of the VSAN.</li>
<li>Add the zones to a <b>zoneset</b>. A VSAN can hold several zonesets, but only one is active.</li>
<li><b>Activate</b> the zoneset: <code>zoneset activate name ZS-FABRIC-A vsan 10</code>. The switch builds the <b>active zoneset</b>, programs the hardware and distributes it to every switch in the VSAN.</li>
</ol>
<p>The active zoneset is a <b>copy</b>. If you later edit a zone or add a zone to the zoneset, the active copy does not change until you activate again. Many "the zone is there but the host sees nothing" tickets are exactly this.</p>

<h3>Basic vs enhanced zoning</h3>
<table class="cmp"><tr><th></th><th>Basic mode</th><th>Enhanced mode</th></tr>
<tr><td>Editing</td><td>Changes apply to the local full database immediately</td><td>First change opens a <b>session</b> and locks zoning for the VSAN fabric-wide</td></tr>
<tr><td>Activation</td><td><code>zoneset activate</code> takes effect at once</td><td>Activation is part of the session and happens only on <code>zone commit vsan 10</code></td></tr>
<tr><td>Distribution</td><td>Active zoneset only (unless <code>zoneset distribute full vsan 10</code>)</td><td>Full database to every switch</td></tr>
<tr><td>Abort</td><td>n/a</td><td><code>no zone commit vsan 10</code> discards the session</td></tr>
</table>
<p>Enable it with <code>zone mode enhanced vsan 10</code>. Enhanced mode prevents two administrators on two switches from making conflicting changes at the same time. The price: if someone opens a session and walks away without committing, nothing they typed takes effect <b>and</b> nobody else can change zoning in that VSAN. <code>show zone status vsan 10</code> shows the mode and any open session:</p>
<pre class="out">MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
<span class="hl">    mode: enhanced merge-control: allow
    session: cli [admin]</span>
    hard-zoning: enabled broadcast: unsupported</pre>

<h3>Device aliases and fcaliases</h3>
<p>Typing WWPNs is slow and error-prone, so you give them names. A <b>device alias</b> maps one name to one pWWN, is valid in <b>every VSAN</b>, and is distributed to all switches through CFS (Cisco Fabric Services). Because it is distributed, device-alias changes go into a pending session and must be committed with <code>device-alias commit</code>; before the commit, <code>show device-alias database</code> does not list them (<code>show device-alias pending</code> does). An <b>fcalias</b> belongs to one VSAN, can hold several members, and is part of that VSAN's zoning database. Most teams standardise on device aliases.</p>
<pre class="code"><span class="c">! lab 2: aliases, one SIST zone, zoneset, activation</span>
device-alias database
  device-alias name ESX01-HBA1 pwwn 20:00:00:25:b5:aa:00:01
  device-alias name ARRAY1-SPA0 pwwn 50:06:01:60:3e:a0:12:34
exit
device-alias commit
zone name ESX01_ARRAY1 vsan 10
  member device-alias ESX01-HBA1
  member device-alias ARRAY1-SPA0
zoneset name ZS-FABRIC-A vsan 10
  member ESX01_ARRAY1
zoneset activate name ZS-FABRIC-A vsan 10</pre>

<div class="eg"><p><b>Worked example: counting zones.</b> 40 hosts, each with one HBA per fabric, and an array with two ports per fabric. SIST: 40 × 2 = <b>80 zones per fabric</b>, 160 in total. Smart zoning with one zone per 10-host cluster: 4 zones per fabric, and the hardware still only programs the 80 host-to-array pairs. A single "everything" zone would program 42 × 41 = 1,722 pairs, including host-to-host pairs that should never exist.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Editing a zone and forgetting to reactivate the zoneset. Activating a <i>different</i> zoneset name (for example a test zoneset) and removing every production zone in one command. Leaving an enhanced session uncommitted. Using interface members and then re-cabling.</p></div>
<div class="exam"><p><b>Exam tip.</b> One active zoneset per VSAN; default zone deny; MDS enforces hard zoning. Enhanced zoning = session lock, full database distribution, changes (including activation) only on <code>zone commit</code>. Device aliases are global and CFS-distributed (need <code>device-alias commit</code>); fcaliases are per VSAN.</p></div>

<div class="scn"><h4>The zone with a typo</h4><p>ESX02 was finally in VSAN 10 but still had no disks. <code>show zone name ESX02_ARRAY1 vsan 10</code> showed the member <code>pwwn 20:00:00:25:b5:aa:00:20</code>, while <code>show flogi database</code> showed the HBA as <code>…aa:00:02</code>: two digits swapped. The engineer removed the wrong member, added the correct pWWN, and then checked <code>show zoneset active vsan 10</code>: the zone was not there at all, because nobody had added it to ZS-FABRIC-A. He added it and reactivated the zoneset, keeping ESX01's zone in place.</p><p><b>Lesson:</b> check the member against the FLOGI table, then check that the zone is in the <i>active</i> zoneset.</p></div>

<div class="iv"><p class="q">"What is the difference between basic and enhanced zoning, and why would you choose enhanced?"</p><p>Strong answer: in basic mode each switch edits its full database directly and activation applies immediately; only the active zoneset is distributed by default. Enhanced mode uses a fabric-wide session lock, distributes the full database, and applies all changes, including activation, atomically on <code>zone commit</code>. You choose it to stop concurrent conflicting changes and keep every switch's full database identical. Mention the operational risk (uncommitted sessions) and the commands to check and discard them: <code>show zone status</code>, <code>show zone pending-diff</code>, <code>no zone commit</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zoning decides which initiators and targets can see each other inside a VSAN; the default zone should stay deny.</li>
<li>Zone on pWWN or device alias; use single-initiator, single-target zones or smart zoning.</li>
<li>Zones live in the full database, are grouped into a zoneset, and only the activated copy is enforced.</li>
<li>Enhanced mode locks the VSAN in a session; nothing happens until <code>zone commit vsan N</code>.</li>
<li>Device aliases are global and need <code>device-alias commit</code>; fcaliases are per VSAN.</li>
</ul></div>
`,hi:`
<p>VSAN ek building floor hai. <b>Zoning</b> us floor ke locked meeting rooms ka set hai. Floor par sab ek hi directory mein hain, lekin koi insaan room mein tabhi ja sakta hai jab uska naam us room ki list mein ho. Fibre Channel mein initiator ek target ko tabhi discover aur login kar sakta hai jab dono VSAN ke <b>active zoneset</b> ki same zone ke members hon.</p>

<h3>Zoning zaroori kyun hai</h3>
<ul>
<li><b>Security aur data safety.</b> Zoning ke bina har host har array port dekhta hai. Ek Windows server jo VMware cluster ka LUN dekhta hai, use "initialise" karne ka offer de sakta hai aur datastore barbaad kar sakta hai.</li>
<li><b>Stability.</b> Jab koi device judta ya nikalta hai, fabric un devices ko <b>RSCN</b> (registered state change notification) bhejta hai jo uske saath zone share karte hain. Chhoti zones ka matlab hai ki flap karta HBA sirf apne targets ko disturb karta hai, sainkdon hosts ko nahi.</li>
<li><b>Default deny.</b> MDS par <b>default zone</b> (jo devices kisi active zone mein nahi hain) default mein <b>deny</b> hai. Ise waise hi rehne do: naya device tab tak kuch na dekhe jab tak aap use jaan-boojhkar zone na karo.</li>
</ul>

<h3>Soft aur hard zoning</h3>
<p><b>Soft zoning</b> sirf name server ke replies filter karti hai: host ko uski zones ke bahar ke targets nahi bataye jaate, lekin agar use pehle se koi FCID pata ho to woh phir bhi frames bhej sakta hai. <b>Hard zoning</b> zones ko switch hardware mein har frame par enforce karti hai: jo devices saath zoned nahi hain unke beech ke frames port ASIC drop kar deta hai. Cisco MDS zoning hardware mein enforce karta hai, isliye aapko dono milte hain: filtered name server replies aur frame-level enforcement.</p>

<h3>Zone member types</h3>
<table class="cmp"><tr><th>Member</th><th>Example</th><th>Kiske saath chalta hai</th><th>Faisla</th></tr>
<tr><td><b>pwwn</b></td><td><code>member pwwn 20:00:00:25:b5:aa:00:01</code></td><td>HBA port, jahan bhi cable ho</td><td>Best practice</td></tr>
<tr><td><b>device-alias</b></td><td><code>member device-alias ESX01-HBA1</code></td><td>Naam ke peeche wala pWWN</td><td>Best practice, readable</td></tr>
<tr><td><b>fcalias</b></td><td><code>member fcalias ESX01</code></td><td>Alias mein define members (per VSAN)</td><td>Theek, par VSAN-local</td></tr>
<tr><td><b>fcid</b></td><td><code>member fcid 0x0a0000</code></td><td>Address, jo badal sakta hai</td><td>Avoid karo</td></tr>
<tr><td><b>interface</b></td><td><code>member interface fc1/7 swwn …</code></td><td>Switch port, usmein jo bhi lage</td><td>Avoid karo; re-cabling par toot-ta hai</td></tr>
</table>

<h3>Zone design: single initiator, single target</h3>
<p>Recommended pattern <b>single-initiator, single-target (SIST)</b> hai: har zone mein ek host HBA aur ek array port. Har fabric mein do array ports hon to ek host HBA ko do zones milti hain. Isse bahut saari chhoti zones banti hain, lekin har ek safe aur padhne mein aasaan hai. Bade "saare hosts saare arrays ke saath" zones initiators ko ek doosre ko dekhne aur disturb karne dete hain.</p>
<p><b>Smart zoning</b> MDS ka feature hai jo kam zones ke saath SIST jaisi safety deta hai: aap ek zone mein kai members daalte ho aur har ek ko <code>init</code> ya <code>target</code> tag karte ho, aur switch hardware mein sirf initiator-to-target pairs program karta hai.</p>
<pre class="code">zone smart-zoning enable vsan 10
zone name CLUSTER1_ARRAY1 vsan 10
  member device-alias ESX01-HBA1 init
  member device-alias ESX02-HBA1 init
  member device-alias ARRAY1-SPA0 target</pre>

<h3>Zone, zoneset, activation</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zone se zoneset se active zoneset">
<rect x="15" y="30" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">Full zone database</text>
<rect x="30" y="65" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="110" y="85" text-anchor="middle" class="svg-ink" font-size="12">zone ESX01_ARRAY1</text>
<rect x="30" y="102" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">zone ESX02_ARRAY1</text>
<rect x="30" y="139" width="160" height="30" rx="6" fill="#bae6fd"/><text x="110" y="159" text-anchor="middle" class="svg-ink" font-size="12">zoneset ZS-FABRIC-A</text>
<line x1="205" y1="105" x2="265" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="265,105 255,100 255,110" fill="#64748b"/>
<rect x="265" y="75" width="130" height="60" rx="8" fill="#fde68a"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="12">zoneset activate</text><text x="330" y="118" text-anchor="middle" class="svg-muted" font-size="12">(+ zone commit)</text>
<line x1="395" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="440,105 430,100 430,110" fill="#64748b"/>
<rect x="440" y="30" width="185" height="150" rx="8" fill="#ddd6fe"/><text x="532" y="52" text-anchor="middle" class="svg-ink" font-size="13">Active zoneset</text>
<text x="532" y="90" text-anchor="middle" class="svg-ink" font-size="12">hardware mein enforce</text><text x="532" y="112" text-anchor="middle" class="svg-muted" font-size="12">har VSAN mein ek</text><text x="532" y="134" text-anchor="middle" class="svg-muted" font-size="12">copy hai, link nahi</text>
</svg><p class="cap">Zone edit karne se sirf full database badalta hai. Jab tak zoneset dobara activate na ho (aur enhanced mode mein commit na ho), kuch enforce nahi hota.</p></div>
<ol>
<li>VSAN ke <b>full zone database</b> mein zones banao.</li>
<li>Zones ko ek <b>zoneset</b> mein jodo. Ek VSAN mein kai zonesets ho sakte hain, lekin active sirf ek hota hai.</li>
<li>Zoneset ko <b>activate</b> karo: <code>zoneset activate name ZS-FABRIC-A vsan 10</code>. Switch <b>active zoneset</b> banata hai, hardware program karta hai aur use VSAN ke har switch tak distribute karta hai.</li>
</ol>
<p>Active zoneset ek <b>copy</b> hai. Agar aap baad mein zone edit karo ya zoneset mein zone jodo, to active copy tab tak nahi badalti jab tak aap dobara activate na karo. "Zone hai lekin host ko kuch nahi dikhta" wale bahut saare tickets bilkul yahi hote hain.</p>

<h3>Basic vs enhanced zoning</h3>
<table class="cmp"><tr><th></th><th>Basic mode</th><th>Enhanced mode</th></tr>
<tr><td>Editing</td><td>Changes local full database par turant lagte hain</td><td>Pehla change ek <b>session</b> kholta hai aur VSAN ki zoning fabric-wide lock karta hai</td></tr>
<tr><td>Activation</td><td><code>zoneset activate</code> turant lagta hai</td><td>Activation session ka hissa hai aur sirf <code>zone commit vsan 10</code> par hota hai</td></tr>
<tr><td>Distribution</td><td>Sirf active zoneset (jab tak <code>zoneset distribute full vsan 10</code> na ho)</td><td>Poora full database har switch tak</td></tr>
<tr><td>Abort</td><td>n/a</td><td><code>no zone commit vsan 10</code> session discard karta hai</td></tr>
</table>
<p>Ise <code>zone mode enhanced vsan 10</code> se enable karo. Enhanced mode do switches par do administrators ko ek saath conflicting changes karne se rokta hai. Keemat: agar koi session khol kar commit kiye bina chala jaaye, to usne jo bhi type kiya woh nahi lagta <b>aur</b> us VSAN mein koi aur zoning change nahi kar sakta. <code>show zone status vsan 10</code> mode aur koi khula session dikhata hai:</p>
<pre class="out">MDS-A# show zone status vsan 10
VSAN: 10 default-zone: deny distribute: full Interop: default
<span class="hl">    mode: enhanced merge-control: allow
    session: cli [admin]</span>
    hard-zoning: enabled broadcast: unsupported</pre>

<h3>Device aliases aur fcaliases</h3>
<p>WWPNs type karna slow aur error-prone hai, isliye aap unhe naam dete ho. <b>Device alias</b> ek naam ko ek pWWN se map karta hai, <b>har VSAN</b> mein valid hai, aur CFS (Cisco Fabric Services) se saare switches tak distribute hota hai. Kyunki yeh distribute hota hai, device-alias changes ek pending session mein jaate hain aur <code>device-alias commit</code> se commit karne padte hain; commit se pehle <code>show device-alias database</code> unhe list nahi karta (<code>show device-alias pending</code> karta hai). <b>Fcalias</b> ek VSAN ka hota hai, kai members rakh sakta hai, aur us VSAN ke zoning database ka hissa hai. Zyada tar teams device aliases par standardise karti hain.</p>
<pre class="code"><span class="c">! lab 2: aliases, ek SIST zone, zoneset, activation</span>
device-alias database
  device-alias name ESX01-HBA1 pwwn 20:00:00:25:b5:aa:00:01
  device-alias name ARRAY1-SPA0 pwwn 50:06:01:60:3e:a0:12:34
exit
device-alias commit
zone name ESX01_ARRAY1 vsan 10
  member device-alias ESX01-HBA1
  member device-alias ARRAY1-SPA0
zoneset name ZS-FABRIC-A vsan 10
  member ESX01_ARRAY1
zoneset activate name ZS-FABRIC-A vsan 10</pre>

<div class="eg"><p><b>Worked example: zones ginna.</b> 40 hosts, har ek ka har fabric mein ek HBA, aur ek array jiske har fabric mein do ports. SIST: 40 × 2 = <b>har fabric mein 80 zones</b>, kul 160. Har 10-host cluster ke liye ek zone ke saath smart zoning: har fabric mein 4 zones, aur hardware phir bhi sirf 80 host-to-array pairs program karta hai. Ek single "sab kuch" zone 42 × 41 = 1,722 pairs program karti, jismein host-to-host pairs bhi hote jo kabhi exist nahi karne chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Zone edit karke zoneset reactivate karna bhool jaana. <i>Alag</i> zoneset naam (jaise test zoneset) activate karke ek command mein har production zone hata dena. Enhanced session ko uncommitted chhod dena. Interface members use karna aur phir re-cabling karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> Har VSAN mein ek active zoneset; default zone deny; MDS hard zoning enforce karta hai. Enhanced zoning = session lock, full database distribution, changes (activation bhi) sirf <code>zone commit</code> par. Device aliases global aur CFS-distributed hain (<code>device-alias commit</code> chahiye); fcaliases per VSAN hain.</p></div>

<div class="scn"><h4>Typo wali zone</h4><p>ESX02 aakhirkar VSAN 10 mein tha lekin abhi bhi disks nahi thi. <code>show zone name ESX02_ARRAY1 vsan 10</code> member <code>pwwn 20:00:00:25:b5:aa:00:20</code> dikha raha tha, jabki <code>show flogi database</code> HBA ko <code>…aa:00:02</code> dikha raha tha: do digits ulte the. Engineer ne galat member hataya, sahi pWWN joda, aur phir <code>show zoneset active vsan 10</code> check kiya: zone wahan thi hi nahi, kyunki kisi ne use ZS-FABRIC-A mein joda hi nahi tha. Usne use joda aur zoneset reactivate kiya, ESX01 ki zone ko jagah par rakhte hue.</p><p><b>Seekh:</b> member ko FLOGI table se match karo, phir check karo ki zone <i>active</i> zoneset mein hai.</p></div>

<div class="iv"><p class="q">"Basic aur enhanced zoning mein kya farak hai, aur aap enhanced kyun chunoge?"</p><p>Strong answer: basic mode mein har switch apna full database seedha edit karta hai aur activation turant lagta hai; default mein sirf active zoneset distribute hota hai. Enhanced mode fabric-wide session lock use karta hai, full database distribute karta hai, aur saare changes, activation samet, <code>zone commit</code> par atomically apply karta hai. Aap ise concurrent conflicting changes rokne aur har switch ka full database identical rakhne ke liye chunte ho. Operational risk (uncommitted sessions) aur unhe check aur discard karne ke commands batao: <code>show zone status</code>, <code>show zone pending-diff</code>, <code>no zone commit</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zoning tay karti hai ki VSAN ke andar kaunse initiators aur targets ek doosre ko dekh sakte hain; default zone deny rehni chahiye.</li>
<li>pWWN ya device alias par zone karo; single-initiator, single-target zones ya smart zoning use karo.</li>
<li>Zones full database mein rehti hain, zoneset mein group hoti hain, aur sirf activated copy enforce hoti hai.</li>
<li>Enhanced mode VSAN ko session mein lock karta hai; <code>zone commit vsan N</code> tak kuch nahi hota.</li>
<li>Device aliases global hain aur <code>device-alias commit</code> chahiye; fcaliases per VSAN hain.</li>
</ul></div>
`}};export{e as default};