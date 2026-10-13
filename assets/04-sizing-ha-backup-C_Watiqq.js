var e={id:`sizing-ha-backup`,h:{en:`Sizing, HA and backup of the FortiManager itself (theory)`,hi:`FortiManager ka sizing, HA aur backup (theory)`},body:{en:`
<div class="note"><p><b>Theory chapter.</b> The simulator has one FortiManager, FMG-1, with no high availability, no backup function and no sizing limits. Everything on high availability (HA) and backup below describes the real product in general terms. Check the current administration guide of your version for exact limits and commands.</p></div>

<p>A school keeps one master register of all students. If the register is lost, nobody knows who belongs in which class, even though the classes keep running. FortiManager is the master register of your firewall configuration. The firewalls keep forwarding without it, but without it you cannot see, change or audit the estate. So the question is not only "how do I manage FortiGates" but also "how do I protect the manager".</p>

<h3>What happens when FortiManager is down</h3>
<p>FortiManager is outside the traffic path. If FMG-1 is switched off, PC-MDU still reaches SRV-WEB, because MDU-FGT keeps the last configuration it received. What you lose is central change, status and the audit trail. In the simulator the same idea shows as <code>conn: down</code> in <code>diagnose dvm device list</code>, with the configuration status no longer in sync because the device cannot be checked. When the manager returns, the tunnels come up again by themselves.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Protecting the manager">
<rect x="40" y="20" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">FMG primary</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">live database</text>
<rect x="450" y="20" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">FMG backup unit</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">synchronised copy</text>
<line x1="190" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">HA sync (theory)</text>
<rect x="40" y="120" width="150" height="50" rx="8" fill="#fde68a"/><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="12">Config backup file</text>
<rect x="450" y="120" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="150" text-anchor="middle" class="svg-ink" font-size="12">FortiGates forward</text>
<line x1="115" y1="76" x2="115" y2="120" stroke="#64748b" stroke-width="2"/><line x1="525" y1="76" x2="525" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="230" y="150" class="svg-muted" font-size="12">Off-box copy, tested restore</text>
</svg><p class="cap">Two different protections: a second unit for availability, and a backup file for recovery.</p></div>

<h3>Sizing</h3>
<p><b>Sizing</b> means choosing how big the FortiManager must be. The inputs are the number of managed devices, the number of ADOMs, how large the policy packages and object tables are, how many administrators work at the same time, and how many revisions you keep. A virtual FortiManager is licensed for a number of devices and needs enough memory, CPU and disk for the database. Every revision stores a copy of the managed configuration, so a large estate with frequent installs grows the database. Plan with headroom, and re-check after each growth step. Kaveri Retail with four devices is tiny; an operator with hundreds of branches is not.</p>

<h3>High availability</h3>
<p>In the real product, <b>FortiManager HA</b> pairs a primary unit with one or more backup units and synchronises the database to them. If the primary fails, an administrator promotes a backup, or failover is automatic where the design supports it. FortiGates must be able to find the new primary, which is a design topic: address, routes, and the FortiGate settings that name the manager. HA protects against hardware or VM failure. It does not protect against a wrong change, because the mistake is synchronised too. That is why you need backups as well.</p>

<h3>Backup</h3>
<p>A <b>backup</b> is a file with the FortiManager configuration and databases, stored somewhere else. Good practice: back up on a schedule and always before a firmware upgrade or a large change; keep copies outside the FortiManager and outside the same storage; protect the file, because it contains configuration data; and test a restore at least once, in a lab, because an untested backup is only a hope. Also remember that FortiGate configurations can be re-retrieved from the devices, but your intended policies and templates exist only on the FortiManager.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri plans to grow to 40 branches. The team writes a short plan: a larger VM sized for 60 devices to allow growth; a weekly backup plus one before every upgrade, copied to a second location; a quarterly restore test on a spare VM; and a written step list for promoting a backup unit. None of this is configured in the simulator, but the plan is what an interviewer wants to hear.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking HA replaces backup. Keeping the only backup on the same disk. Never testing a restore. Sizing for today's device count only. Forgetting that the FortiGates point to one manager address: if you rebuild the manager with another address, every device needs updating.</p></div>

<div class="exam"><p><b>Exam traps.</b> FortiManager is outside the traffic path, so its failure does not stop forwarding. HA synchronises mistakes as well. A backup is for recovery; HA is for availability. In this course these are theory topics: the simulator does not model them.</p></div>

<div class="scn"><h4>The virtual machine that disappeared with its disk</h4><p>A company ran FortiManager as a VM and kept its only configuration backup on the same datastore. A storage fault destroyed both. The branches kept working, which was a relief, but nobody could install policy for two weeks while the team rebuilt ADOMs from the devices. Retrieving the device configurations restored the running policy, but templates, packages and naming had to be rebuilt by hand.</p><p><b>Lesson:</b> a backup that shares the failure of the thing it protects is not a backup.</p></div>

<div class="iv"><p class="q">"How do you protect the FortiManager itself?"</p><p>Separate availability from recovery. For availability, an HA design with a backup unit and a tested failover procedure. For recovery, scheduled and pre-change backups stored off the box, a restore test, and sizing with growth headroom. Add that the FortiGates keep forwarding if the manager is down, so the impact is loss of central control, not loss of service. Say clearly that you know HA and backup from the product guide, not from the lab.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The manager can fail without stopping traffic, but you lose control and audit.</li>
<li>Sizing depends on devices, ADOMs, package size, admins and revisions kept.</li>
<li>HA gives availability and copies mistakes; backup gives recovery.</li>
<li>Store backups off the box and test a restore.</li>
<li>HA, backup and sizing limits are theory here; the simulator does not model them.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Theory chapter.</b> Simulator mein ek hi FortiManager hai, FMG-1, jisme high availability, backup function ya sizing limits nahi hain. High availability (HA) aur backup ke baare mein neeche jo bhi hai wo real product ka general description hai. Exact limits aur commands ke liye apne version ki administration guide dekho.</p></div>

<p>Ek school ke paas saare students ka ek master register hota hai. Register kho jaye to kisi ko pata nahi ki kaun kis class mein hai, bhale classes chalti rahein. FortiManager aapke firewall configuration ka master register hai. Firewalls uske bina bhi forward karte hain, par uske bina aap estate ko dekh, badal ya audit nahi sakte. To sawal sirf "FortiGates ko kaise manage karein" nahi, balki "manager ko kaise protect karein" bhi hai.</p>

<h3>FortiManager down ho to kya hota hai</h3>
<p>FortiManager traffic path ke bahar hai. FMG-1 band ho to bhi PC-MDU SRV-WEB tak pahunchta hai, kyunki MDU-FGT apni last mili configuration rakhta hai. Aap kya khote ho: central change, status aur audit trail. Simulator mein yahi idea <code>diagnose dvm device list</code> mein <code>conn: down</code> ki tarah dikhta hai, aur configuration status in sync nahi rehta kyunki device check nahi ho sakta. Manager wapas aaye to tunnels apne aap wapas up ho jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Protecting the manager">
<rect x="40" y="20" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">FMG primary</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">live database</text>
<rect x="450" y="20" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">FMG backup unit</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">synchronised copy</text>
<line x1="190" y1="48" x2="450" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">HA sync (theory)</text>
<rect x="40" y="120" width="150" height="50" rx="8" fill="#fde68a"/><text x="115" y="150" text-anchor="middle" class="svg-ink" font-size="12">Config backup file</text>
<rect x="450" y="120" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="150" text-anchor="middle" class="svg-ink" font-size="12">FortiGates forward</text>
<line x1="115" y1="76" x2="115" y2="120" stroke="#64748b" stroke-width="2"/><line x1="525" y1="76" x2="525" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="230" y="150" class="svg-muted" font-size="12">Off-box copy, tested restore</text>
</svg><p class="cap">Do alag protections: availability ke liye doosra unit, recovery ke liye backup file.</p></div>

<h3>Sizing</h3>
<p><b>Sizing</b> ka matlab hai ye chunna ki FortiManager kitna bada hona chahiye. Inputs hain managed devices ki sankhya, ADOMs ki sankhya, policy packages aur object tables kitne bade hain, ek saath kitne administrators kaam karte hain, aur kitni revisions rakhte ho. Virtual FortiManager ek device count ke liye licensed hota hai aur database ke liye kaafi memory, CPU aur disk chahiye. Har revision managed configuration ki ek copy store karti hai, isliye badi estate mein baar-baar installs se database badhta hai. Headroom ke saath plan karo, aur har growth step ke baad dobara check karo. Chaar devices wala Kaveri Retail chhota hai; sainkdon branches wala operator nahi.</p>

<h3>High availability</h3>
<p>Real product mein <b>FortiManager HA</b> ek primary unit ko ek ya zyada backup units se jodta hai aur database unko synchronise karta hai. Primary fail ho to administrator backup ko promote karta hai, ya jahan design support kare wahan failover automatic hota hai. FortiGates ko naya primary dhoondhna aana chahiye, jo ek design topic hai: address, routes, aur FortiGate ki wo settings jo manager ka naam batati hain. HA hardware ya VM failure se bachata hai. Ye galat change se nahi bachata, kyunki galti bhi synchronise ho jaati hai. Isliye backups bhi chahiye.</p>

<h3>Backup</h3>
<p><b>Backup</b> ek file hai jisme FortiManager configuration aur databases hote hain, kahin aur store. Achhi practice: schedule par backup lo aur firmware upgrade ya bade change se pehle zaroor; copies FortiManager ke bahar aur usi storage ke bahar rakho; file ko protect karo, kyunki usme configuration data hai; aur restore ko kam se kam ek baar lab mein test karo, kyunki untested backup sirf ummeed hai. Ye bhi yaad rakho ki FortiGate configurations devices se dobara retrieve ho sakti hain, par aapki intended policies aur templates sirf FortiManager par hain.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri 40 branches tak badhne ka plan banata hai. Team chhota plan likhti hai: growth ke liye 60 devices ke hisaab se bada VM; har hafte backup aur har upgrade se pehle ek, doosri location par copy; spare VM par quarterly restore test; aur backup unit promote karne ke written steps. Simulator mein inme se kuch configure nahi hota, par interviewer yahi plan sunna chahta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sochna ki HA backup ki jagah le leta hai. Ekmatra backup usi disk par rakhna. Restore kabhi test na karna. Sirf aaj ke device count ke hisaab se size karna. Ye bhoolna ki FortiGates ek manager address ki taraf point karte hain: manager ko doosre address ke saath rebuild karo to har device update karna padega.</p></div>

<div class="exam"><p><b>Exam traps.</b> FortiManager traffic path ke bahar hai, isliye uska failure forwarding nahi rokta. HA galtiyan bhi synchronise karta hai. Backup recovery ke liye hai; HA availability ke liye. Is course mein ye theory topics hain: simulator inhe model nahi karta.</p></div>

<div class="scn"><h4>Wo virtual machine jo apni disk ke saath gayab ho gayi</h4><p>Ek company FortiManager VM ki tarah chalati thi aur uska ekmatra configuration backup usi datastore par tha. Storage fault ne dono nasht kar diye. Branches chalte rahe, jo rahat thi, par do hafte tak koi policy install nahi kar saka jab team ne devices se ADOMs dobara banaye. Device configurations retrieve karne se running policy wapas aayi, par templates, packages aur naming haath se dobara banane pade.</p><p><b>Lesson:</b> jo backup us cheez ki failure share kare jise wo bachata hai, wo backup nahi hai.</p></div>

<div class="iv"><p class="q">"FortiManager ko khud kaise protect karte ho?"</p><p>Availability aur recovery alag karo. Availability ke liye backup unit aur tested failover procedure ke saath HA design. Recovery ke liye scheduled aur pre-change backups jo box ke bahar store hon, restore test, aur growth headroom ke saath sizing. Jodo ki manager down ho to FortiGates forward karte rehte hain, isliye impact central control ka loss hai, service ka nahi. Saaf kaho ki HA aur backup aap product guide se jaante ho, lab se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager fail ho sakta hai bina traffic roke, par control aur audit chala jata hai.</li>
<li>Sizing devices, ADOMs, package size, admins aur rakhi gayi revisions par depend karti hai.</li>
<li>HA availability deta hai aur galtiyan copy karta hai; backup recovery deta hai.</li>
<li>Backups box ke bahar rakho aur restore test karo.</li>
<li>HA, backup aur sizing limits yahan theory hain; simulator inhe model nahi karta.</li>
</ul></div>
`}};export{e as default};