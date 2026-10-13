var e={id:`verify-failover`,h:{en:`Verifying the cluster, testing failover and upgrading`,hi:`Cluster verify karna, failover test aur upgrade`},body:{en:`
<p>A cluster that has never been tested is a hope, not a design. This chapter shows how to verify that a cluster is healthy, how to run a controlled failover test, and how to upgrade it with little interruption. The commands are real FortiOS commands; the output shown on a real device depends on the model and version, so this chapter explains <b>what to look for</b> rather than printing sample output. The commands are <b>not run in the simulator</b>.</p>

<h3>The verification commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it tells you</th></tr>
<tr><td><code>get system ha status</code></td><td>Mode, group, cluster health, which unit is primary and why it was selected, the member list with serial numbers and uptime, and whether configuration is in sync.</td></tr>
<tr><td><code>diagnose sys ha status</code></td><td>A more detailed view of the same cluster, including each member's priority, monitored-interface state and role.</td></tr>
<tr><td><code>diagnose sys ha checksum cluster</code></td><td>The configuration checksum of every member. Identical values mean in sync.</td></tr>
<tr><td><code>diagnose sys ha checksum show</code></td><td>Checksums per configuration section, to locate what differs.</td></tr>
<tr><td><code>diagnose sys ha history read</code></td><td>The log of HA events, such as role changes and the reason for each failover.</td></tr>
<tr><td><code>execute ha manage</code></td><td>Opens a CLI session to another member from the primary.</td></tr>
<tr><td><code>diagnose sys ha reset-uptime</code></td><td>Resets the HA age of the unit you run it on; used to force a controlled failover.</td></tr></table>

<h3>A healthy cluster: your checklist</h3>
<ul>
<li>The status shows the expected <b>mode</b> (HA A-P) and a health status of OK.</li>
<li>Exactly <b>one primary</b> and the right number of secondaries, with the serial numbers you expect.</li>
<li>The configuration state is <b>in sync</b>, and the checksums from the cluster command match.</li>
<li>Both units show the same <b>firmware version</b> and the expected monitored-interface state.</li>
<li>The history shows no unexplained role changes or repeated heartbeat-lost events.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Failover test cycle">
<rect x="10" y="50" width="115" height="60" rx="10" fill="#bae6fd"/><text x="67" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Baseline</text>
<rect x="140" y="50" width="115" height="60" rx="10" fill="#bbf7d0"/><text x="197" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 Start ping</text>
<rect x="270" y="50" width="115" height="60" rx="10" fill="#fde68a"/><text x="327" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Cause fault</text>
<rect x="400" y="50" width="115" height="60" rx="10" fill="#fed7aa"/><text x="457" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 Observe</text>
<rect x="530" y="50" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="580" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 Restore</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Record the result and how long traffic was interrupted</text>
</svg><p class="cap">The same five-step cycle works for every failover test.</p></div>

<h3>Running a failover test</h3>
<p>Agree a window with the business first, because a failover test can interrupt traffic for a short time. Then follow the cycle:</p>
<ol>
<li><b>Baseline.</b> Record <code>get system ha status</code> and the checksum output. Note which unit is primary.</li>
<li><b>Start traffic.</b> From a client on the LAN, run a continuous ping to an address beyond the firewall (and, if you use session pickup, keep a long TCP session such as an SSH login open).</li>
<li><b>Cause a fault.</b> Choose one method per test: unplug a monitored interface, power off the primary, pull one heartbeat cable (the cluster should stay up on the other), or reset the HA uptime on the primary with <code>diagnose sys ha reset-uptime</code> to force a clean role change when override is disabled.</li>
<li><b>Observe.</b> Watch the ping. A healthy failover loses only a few packets. Check that the SSH session survives if session pickup is on. Run <code>get system ha status</code> and <code>diagnose sys ha history read</code> to see the new primary and the recorded reason.</li>
<li><b>Restore.</b> Reconnect the cable or power on the unit, wait for it to rejoin as secondary, and verify the configuration is in sync. With override disabled it should <b>not</b> take the role back.</li>
</ol>
<p>Repeat the test for each trigger type you rely on: a monitored interface fault, a power loss and a heartbeat link fault. Write the observed outage time in the runbook so that the business knows what to expect.</p>

<h3>Upgrading a cluster</h3>
<p>FortiOS can upgrade a cluster with minimal disruption. The primary pushes the new firmware to the secondary. The secondary upgrades and reboots first, then the cluster fails over to it, and the old primary upgrades and rejoins. This is controlled by the <code>upgrade-mode</code> setting in the HA configuration, where the uninterruptible method is the one designed to keep traffic flowing. Always read the release notes, because some upgrade paths need an intermediate version, and take a configuration backup first. After the upgrade, check that both units run the same build and that the cluster is in sync.</p>

<div class="eg"><p><b>Worked example.</b> The HQ team schedules Sunday 02:00. Baseline: FGT-A primary. They start a ping from a LAN laptop to a test address beyond the firewall, and an SSH session to a lab server. They unplug port1 on FGT-A. The ping loses three packets, the SSH session continues thanks to session pickup, and the history shows FGT-B became primary because a monitored interface was lost. They reconnect port1 and confirm FGT-A rejoins as secondary and stays so because override is disabled. The result is added to the runbook.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing for the first time in production during an actual outage. Pulling the heartbeat cables together and creating a split brain. Declaring success because the ping works without checking that the configuration is still in sync. Forgetting to restore the cable and leaving the cluster degraded.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resetting the HA uptime changes the age criterion, so it forces a failover only when override is disabled and the age margin is exceeded or the peer is otherwise preferred; know that it is a test tool, not a configuration setting.</p></div>

<div class="scn"><h4>The failover test that found the missing monitor</h4><p>A bank branch tested HA before go-live by powering off the primary: everything worked. A later test, unplugging the ISP cable, caused no failover at all. The WAN interface was not monitored. Because the team tests each trigger separately, they found it before real users did.</p><p><b>Lesson:</b> test every trigger you depend on, not just one.</p></div>

<div class="iv"><p class="q">"How would you test a FortiGate cluster after building it?"</p><p>I verify status and checksums, start a continuous ping and a long session through the cluster, then trigger failover separately by monitored interface fault, power loss and heartbeat link loss. I record the packets lost, check the HA history, restore the fault, and confirm the cluster is in sync. I note the observed outage time for the runbook.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get system ha status</code> and the checksum commands are the first stop.</li>
<li>Look for one primary, health OK, in-sync configuration and matching firmware.</li>
<li>Test each failover trigger separately with a continuous ping.</li>
<li>A heartbeat cable pulled alone should not break the cluster; pulling all can cause split brain.</li>
<li>Upgrade clusters with the documented method and read the release notes.</li>
</ul></div>
`,hi:`
<p>Jis cluster ko kabhi test nahi kiya gaya woh ummeed hai, design nahi. Yeh chapter dikhata hai ki cluster healthy hai yeh verify kaise karein, controlled failover test kaise chalayein, aur kam interruption ke saath upgrade kaise karein. Commands asli FortiOS commands hain; real device par output model aur version par depend karta hai, isliye yeh chapter sample output print karne ke bajaye <b>kya dekhna hai</b> samjhata hai. Commands <b>simulator mein nahi chalaye gaye hain</b>.</p>

<h3>Verification commands</h3>
<table class="cmp"><tr><th>Command</th><th>Yeh kya batata hai</th></tr>
<tr><td><code>get system ha status</code></td><td>Mode, group, cluster health, kaunsa unit primary hai aur kyun select hua, serial numbers aur uptime ke saath member list, aur configuration in sync hai ya nahi.</td></tr>
<tr><td><code>diagnose sys ha status</code></td><td>Usi cluster ka zyada detailed view, jisme har member ki priority, monitored-interface state aur role shamil hain.</td></tr>
<tr><td><code>diagnose sys ha checksum cluster</code></td><td>Har member ka configuration checksum. Identical values ka matlab in sync.</td></tr>
<tr><td><code>diagnose sys ha checksum show</code></td><td>Configuration section ke hisaab se checksums, taaki alag hone wala hissa mile.</td></tr>
<tr><td><code>diagnose sys ha history read</code></td><td>HA events ka log, jaise role changes aur har failover ka karan.</td></tr>
<tr><td><code>execute ha manage</code></td><td>Primary se doosre member par CLI session kholta hai.</td></tr>
<tr><td><code>diagnose sys ha reset-uptime</code></td><td>Jis unit par chalate ho uski HA age reset karta hai; controlled failover force karne ke liye use hota hai.</td></tr></table>

<h3>Healthy cluster: aapki checklist</h3>
<ul>
<li>Status mein expected <b>mode</b> (HA A-P) aur health status OK dikhta hai.</li>
<li>Theek <b>ek primary</b> aur sahi sankhya mein secondaries, expected serial numbers ke saath.</li>
<li>Configuration state <b>in sync</b> hai, aur cluster command ke checksums match karte hain.</li>
<li>Dono units same <b>firmware version</b> aur expected monitored-interface state dikhate hain.</li>
<li>History mein koi unexplained role changes ya baar-baar heartbeat-lost events nahi hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Failover test cycle">
<rect x="10" y="50" width="115" height="60" rx="10" fill="#bae6fd"/><text x="67" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Baseline</text>
<rect x="140" y="50" width="115" height="60" rx="10" fill="#bbf7d0"/><text x="197" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 Ping shuru</text>
<rect x="270" y="50" width="115" height="60" rx="10" fill="#fde68a"/><text x="327" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Fault karo</text>
<rect x="400" y="50" width="115" height="60" rx="10" fill="#fed7aa"/><text x="457" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 Observe</text>
<rect x="530" y="50" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="580" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 Restore</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Result aur traffic kitni der ruka, yeh record karo</text>
</svg><p class="cap">Har failover test ke liye wahi paanch-step cycle chalta hai.</p></div>

<h3>Failover test chalana</h3>
<p>Pehle business ke saath window tay karo, kyunki failover test traffic ko thodi der ke liye rok sakta hai. Phir cycle follow karo:</p>
<ol>
<li><b>Baseline.</b> <code>get system ha status</code> aur checksum output record karo. Note karo kaunsa unit primary hai.</li>
<li><b>Traffic shuru karo.</b> LAN ke client se firewall ke paar kisi address par continuous ping chalao (aur session pickup use karte ho to lamba TCP session jaise SSH login khula rakho).</li>
<li><b>Fault karo.</b> Har test mein ek method chuno: monitored interface nikaalo, primary ki power band karo, ek heartbeat cable kheencho (cluster doosre par up rehna chahiye), ya override disabled hone par saaf role change force karne ke liye primary par <code>diagnose sys ha reset-uptime</code> se HA uptime reset karo.</li>
<li><b>Observe.</b> Ping dekho. Healthy failover mein sirf kuch packets jaate hain. Session pickup on ho to check karo ki SSH session bach gaya. Naya primary aur recorded karan dekhne ke liye <code>get system ha status</code> aur <code>diagnose sys ha history read</code> chalao.</li>
<li><b>Restore.</b> Cable wapas lagao ya unit on karo, secondary ki tarah rejoin hone ka intezaar karo, aur verify karo ki configuration in sync hai. Override disabled ho to woh role wapas <b>nahi</b> lena chahiye.</li>
</ol>
<p>Jin trigger types par aap nirbhar ho unke liye test dohrao: monitored interface fault, power loss aur heartbeat link fault. Observed outage time runbook mein likho taaki business ko pata ho kya expect karna hai.</p>

<h3>Cluster upgrade karna</h3>
<p>FortiOS cluster ko minimal disruption ke saath upgrade kar sakta hai. Primary naya firmware secondary ko push karta hai. Secondary pehle upgrade aur reboot hota hai, phir cluster usi par failover karta hai, aur purana primary upgrade hoke rejoin karta hai. Yeh HA configuration ke <code>upgrade-mode</code> setting se control hota hai, jisme uninterruptible method traffic chalta rakhne ke liye bana hai. Hamesha release notes padho, kyunki kuch upgrade paths ko intermediate version chahiye, aur pehle configuration backup lo. Upgrade ke baad check karo ki dono units same build chala rahe hain aur cluster in sync hai.</p>

<div class="eg"><p><b>Worked example.</b> HQ team Sunday 02:00 schedule karti hai. Baseline: FGT-A primary. Woh LAN laptop se firewall ke paar test address ko ping aur lab server ko SSH session shuru karte hain. Woh FGT-A ka port1 nikaalte hain. Ping teen packets khota hai, session pickup ki wajah se SSH session chalta rehta hai, aur history dikhati hai ki FGT-B primary bana kyunki monitored interface gaya. Woh port1 wapas lagate hain aur confirm karte hain ki FGT-A secondary ki tarah rejoin karta hai aur override disabled hone se waisa hi rehta hai. Result runbook mein jod diya jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pehli baar test asli outage ke dauran production mein karna. Dono heartbeat cables ek saath kheench ke split brain bana dena. Sirf ping chal raha hai isliye success maan lena, yeh check kiye bina ki configuration abhi bhi in sync hai. Cable wapas lagana bhool jaana aur cluster ko degraded chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> HA uptime reset karne se age criterion badalta hai, isliye woh failover tabhi force karta hai jab override disabled ho aur age margin paar ho ya peer waise bhi preferred ho; jaan lo ki yeh test tool hai, configuration setting nahi.</p></div>

<div class="scn"><h4>Failover test jisne missing monitor pakda</h4><p>Ek bank branch ne go-live se pehle primary ki power band karke HA test kiya: sab kaam kiya. Baad ke test mein ISP cable nikaalne par failover hua hi nahi. WAN interface monitored nahi tha. Kyunki team har trigger alag se test karti hai, unhone real users se pehle yeh pakad liya.</p><p><b>Lesson:</b> jin triggers par nirbhar ho unme se har ek test karo, sirf ek nahi.</p></div>

<div class="iv"><p class="q">"Cluster banane ke baad FortiGate cluster ko kaise test karoge?"</p><p>Main status aur checksums verify karta hoon, cluster ke through continuous ping aur lamba session shuru karta hoon, phir failover ko alag-alag trigger karta hoon: monitored interface fault, power loss aur heartbeat link loss. Main lost packets record karta hoon, HA history check karta hoon, fault restore karta hoon, aur confirm karta hoon ki cluster in sync hai. Runbook ke liye observed outage time note karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>get system ha status</code> aur checksum commands pehla stop hain.</li>
<li>Ek primary, health OK, in-sync configuration aur matching firmware dekho.</li>
<li>Har failover trigger ko continuous ping ke saath alag se test karo.</li>
<li>Akela heartbeat cable nikalne se cluster nahi tootna chahiye; sab nikaalne se split brain ho sakta hai.</li>
<li>Cluster ko documented method se upgrade karo aur release notes padho.</li>
</ul></div>
`}};export{e as default};