var e={id:`vmm-microseg`,h:{en:`VMM integration, immediacy, microsegmentation and ESGs`,hi:`VMM integration, immediacy, microsegmentation aur ESGs`},body:{en:`
<p>Imagine a hotel where guests keep changing rooms at night. If the front desk had to update every corridor's guest list by hand after each move, mistakes would be constant. Instead, the hotel's booking system talks directly to the key-card system, so a guest's card works in the new room the moment he moves. <b>VMM integration</b> is that link between ACI and the virtualization manager: when a VM moves, its policy moves with it.</p>

<h3>What VMM integration does</h3>
<p>A <b>VMM domain</b> (Virtual Machine Manager domain, class vmmDomP) connects the APIC to a virtualization controller: most commonly <b>VMware vCenter</b>, and also Microsoft SCVMM (older releases), and Kubernetes or OpenShift through the ACI CNI plugin. For vCenter:</p>
<ol>
<li>You create the domain under <b>Virtual Networking → VMM Domains → VMware → Create vCenter Domain</b>: a name, a <b>dynamic</b> VLAN pool (for example 1000-1099), the AAEP of the ESXi-facing leaf ports, the vCenter address, credentials and datacenter name, plus vSwitch policies (LACP, CDP/LLDP).</li>
<li>The APIC logs in to vCenter and creates an <b>APIC-managed distributed switch (VDS)</b> with the domain's name. The VMware admin adds the ESXi hosts and their uplinks to that VDS.</li>
<li>When you associate an EPG with the VMM domain (EPG → Domains → Add VMM Domain Association), the APIC picks a VLAN from the dynamic pool and creates a <b>port group</b> on the VDS named <code>tenant|ap|epg</code>, for example <code>NK-PROD|ECOM|WEB</code>.</li>
<li>The VM admin simply connects VM vNICs to that port group. The APIC learns from vCenter and from LLDP/CDP which ESXi host sits behind which leaf port, and deploys the EPG there.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VMM integration with vCenter">
<rect x="20" y="20" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">APIC</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#fed7aa"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">vCenter</text>
<line x1="170" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">create VDS + port groups, read inventory</text>
<rect x="400" y="100" width="220" height="44" rx="8" fill="#fde68a"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="12">VDS port group</text><text x="510" y="136" text-anchor="middle" class="svg-ink" font-size="12">NK-PROD|ECOM|WEB vlan-1003</text>
<line x1="545" y1="64" x2="545" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="175" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="510" y="200" text-anchor="middle" class="svg-ink" font-size="13">ESXi host + VMs</text>
<line x1="510" y1="144" x2="510" y2="175" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="175" width="160" height="40" rx="8" fill="#bae6fd"/><text x="140" y="200" text-anchor="middle" class="svg-ink" font-size="13">LEAF101 eth1/10</text>
<line x1="220" y1="195" x2="400" y2="195" stroke="#64748b" stroke-width="3"/><text x="310" y="187" text-anchor="middle" class="svg-accent" font-size="12">LLDP/CDP: host found</text>
<line x1="95" y1="64" x2="140" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="60" y="125" class="svg-muted" font-size="12">EPG pushed</text>
</svg><p class="cap">The APIC builds the virtual switch and learns where each host is cabled, so policy lands on the right leaf ports.</p></div>

<h3>Resolution and deployment immediacy</h3>
<p>Two settings on the EPG-to-domain association decide <b>when</b> policy reaches a leaf. They exist to save hardware resources (VLANs, TCAM) on large fabrics.</p>
<table class="cmp"><tr><th>Setting</th><th>Options</th><th>Meaning</th></tr>
<tr><td><b>Resolution immediacy</b>: when the policy is downloaded to the leaf</td><td><b>Pre-provision</b></td><td>Downloaded to all leaves whose ports carry the domain's AAEP, even before any host is detected</td></tr>
<tr><td></td><td><b>Immediate</b></td><td>Downloaded when a hypervisor attached to the VDS is discovered behind the leaf (via LLDP/CDP)</td></tr>
<tr><td></td><td><b>On Demand</b></td><td>Downloaded only when a VM is connected to the port group on a host behind the leaf</td></tr>
<tr><td><b>Deployment immediacy</b>: when it is programmed in hardware</td><td><b>Immediate</b> / <b>On Demand</b></td><td>As soon as downloaded, or only when the first packet arrives</td></tr>
</table>
<p>Use <b>Pre-provision</b> when the leaf must forward before LLDP/CDP can find the host: for example the ESXi management VMkernel itself on the VDS, or a blade switch between the host and the leaf that does not pass LLDP. Static ports use only deployment immediacy.</p>

<pre class="out">LEAF101# show vlan extended
 VLAN Name                             Encap            Ports
 ---- -------------------------------- ---------------- ------------------------
 21   NK-PROD:WEB-BD                   vxlan-15826915   Eth1/10
 <span class="hl">22   NK-PROD:ECOM:WEB                 vlan-1003        Eth1/10</span></pre>
<p>VLAN 1003 was picked by the APIC from the dynamic pool; nobody typed it.</p>

<h3>Microsegmentation: uSeg EPGs</h3>
<p>A normal EPG groups endpoints by where they attach (port, VLAN, port group). A <b>microsegmented EPG (uSeg EPG)</b> groups them by <b>attributes</b>: IP address or subnet, MAC address, and for VMs also VM name, guest operating system, VM custom attribute, tag, host or datacenter. The uSeg EPG must use the same BD as the base EPG. For VMware VDS, the base EPG's VMM association must allow microsegmentation, and ACI then uses private VLANs on the VDS so that even VM-to-VM traffic on one host passes through the leaf, where policy can be applied.</p>
<p>Two related EPG options: <b>Intra EPG Isolation</b> (enforced = endpoints inside the same EPG cannot talk to each other, typical for backup or PXE networks) and <b>intra-EPG contracts</b> (allow only specific flows inside an EPG).</p>

<h3>Endpoint Security Groups (ESGs)</h3>
<p>Since APIC release 5.0, an <b>ESG</b> is a security-only group scoped to a <b>VRF</b>, separate from forwarding. Endpoints are placed into ESGs by <b>selectors</b>: tag selectors (IP or MAC tags), EPG selectors (everything in an EPG) and IP subnet selectors. Contracts are applied between ESGs (and between an ESG and an L3Out external EPG). Because an ESG can span several BDs in the same VRF, it is the modern way to build security groups without tying them to the network design. ESGs and EPGs do not have contracts with each other; you choose one model per set of endpoints.</p>

<div class="eg"><p><b>Worked example.</b> Security wants any VM whose name ends in <code>-quarantine</code> cut off immediately. Create uSeg EPG QUARANTINE in application profile ECOM, BD WEB-BD, VMM domain NK-VDS, with attribute <i>VM Name ends with -quarantine</i>, and attach no contracts except one to a remediation server. When the VMware admin renames <code>web07</code> to <code>web07-quarantine</code>, the VM leaves EPG WEB and enters QUARANTINE within seconds; its IP address does not change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a static VLAN pool for a VMM domain (VMM needs dynamic allocation). Forgetting to add the VMM domain to the AAEP of the ESXi-facing ports. Leaving LLDP/CDP disabled between leaf and host with Immediate or On Demand resolution, so the leaf never learns where the host is and never deploys the EPG.</p></div>

<div class="exam"><p><b>Exam trap.</b> Resolution immediacy has three options (Pre-provision, Immediate, On Demand); deployment immediacy has two (Immediate, On Demand). The port group name format is tenant|application profile|EPG. uSeg EPGs must share the base EPG's BD.</p></div>

<div class="scn"><h4>The host that lost management after a reboot</h4><p>A team moved the ESXi management VMkernel (vmk0) of every host onto the APIC-managed VDS, in an EPG with resolution immediacy <i>On Demand</i>. Weeks later, a host was rebooted for patching and never came back into vCenter. On the leaf, <code>show vlan extended</code> showed no VLAN for the management EPG on that port. The EPG was waiting for vCenter to report a VM on the host, but vCenter could not reach the host because its management network was not deployed: a chicken-and-egg loop. Changing the management EPG's association to <i>Pre-provision</i> deployed the VLAN on the port at once, and the host reconnected.</p><p><b>Lesson:</b> anything the hypervisor needs before it talks to vCenter must be Pre-provisioned.</p></div>

<div class="iv"><p class="q">"What happens when you associate an EPG with a VMware VMM domain, and what does resolution immediacy control?"</p><p>Strong answer: the APIC allocates a VLAN from the domain's dynamic pool and creates a port group named tenant|ap|epg on the APIC-managed VDS in vCenter; VMs attached to it join the EPG, and the APIC uses vCenter inventory plus LLDP/CDP to know which leaf ports lead to which hosts. Resolution immediacy decides when the policy is downloaded to a leaf (Pre-provision, Immediate on host discovery, On Demand on VM attach); deployment immediacy decides when it is programmed in hardware. Give the vmk0 Pre-provision example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VMM domain links the APIC to vCenter (or others), with a dynamic VLAN pool and an APIC-managed VDS.</li>
<li>EPG + VMM domain = port group tenant|ap|epg; VMs keep their policy when they move.</li>
<li>Resolution immediacy: Pre-provision, Immediate, On Demand; deployment immediacy: Immediate, On Demand.</li>
<li>uSeg EPGs classify endpoints by attributes (IP, MAC, VM name, OS); intra-EPG isolation blocks traffic inside an EPG.</li>
<li>ESGs are VRF-scoped security groups built with selectors, independent of BDs.</li>
</ul></div>
`,hi:`
<p>Ek hotel ki kalpana karo jahan guests raat mein room badalte rehte hain. Agar front desk ko har move ke baad har corridor ki guest list haath se update karni pade, to galtiyan lagataar hongi. Iski jagah hotel ka booking system seedha key-card system se baat karta hai, isliye guest ke move karte hi uska card naye room mein chalta hai. <b>VMM integration</b> ACI aur virtualization manager ke beech wahi link hai: jab VM move karta hai, uski policy uske saath move karti hai.</p>

<h3>VMM integration kya karta hai</h3>
<p><b>VMM domain</b> (Virtual Machine Manager domain, class vmmDomP) APIC ko virtualization controller se jodta hai: sabse common <b>VMware vCenter</b>, aur Microsoft SCVMM (purane releases), aur ACI CNI plugin ke through Kubernetes ya OpenShift. vCenter ke liye:</p>
<ol>
<li>Aap domain <b>Virtual Networking → VMM Domains → VMware → Create vCenter Domain</b> ke neeche banate ho: naam, ek <b>dynamic</b> VLAN pool (jaise 1000-1099), ESXi ki taraf wale leaf ports ka AAEP, vCenter address, credentials aur datacenter name, plus vSwitch policies (LACP, CDP/LLDP).</li>
<li>APIC vCenter mein login karta hai aur domain ke naam ka <b>APIC-managed distributed switch (VDS)</b> banata hai. VMware admin ESXi hosts aur unke uplinks us VDS mein jodta hai.</li>
<li>Jab aap EPG ko VMM domain se associate karte ho (EPG → Domains → Add VMM Domain Association), APIC dynamic pool se ek VLAN chunta hai aur VDS par <code>tenant|ap|epg</code> naam ka <b>port group</b> banata hai, jaise <code>NK-PROD|ECOM|WEB</code>.</li>
<li>VM admin bas VM vNICs us port group se jodta hai. APIC vCenter se aur LLDP/CDP se seekhta hai ki kaunsa ESXi host kis leaf port ke peeche hai, aur EPG wahan deploy karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="vCenter ke saath VMM integration">
<rect x="20" y="20" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">APIC</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#fed7aa"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">vCenter</text>
<line x1="170" y1="42" x2="470" y2="42" stroke="#64748b" stroke-width="2"/><text x="320" y="34" text-anchor="middle" class="svg-accent" font-size="12">VDS + port groups banao, inventory padho</text>
<rect x="400" y="100" width="220" height="44" rx="8" fill="#fde68a"/><text x="510" y="120" text-anchor="middle" class="svg-ink" font-size="12">VDS port group</text><text x="510" y="136" text-anchor="middle" class="svg-ink" font-size="12">NK-PROD|ECOM|WEB vlan-1003</text>
<line x1="545" y1="64" x2="545" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="175" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="510" y="200" text-anchor="middle" class="svg-ink" font-size="13">ESXi host + VMs</text>
<line x1="510" y1="144" x2="510" y2="175" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="175" width="160" height="40" rx="8" fill="#bae6fd"/><text x="140" y="200" text-anchor="middle" class="svg-ink" font-size="13">LEAF101 eth1/10</text>
<line x1="220" y1="195" x2="400" y2="195" stroke="#64748b" stroke-width="3"/><text x="310" y="187" text-anchor="middle" class="svg-accent" font-size="12">LLDP/CDP: host mila</text>
<line x1="95" y1="64" x2="140" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="60" y="125" class="svg-muted" font-size="12">EPG push hua</text>
</svg><p class="cap">APIC virtual switch banata hai aur seekhta hai ki har host kahan cabled hai, isliye policy sahi leaf ports par pahunchti hai.</p></div>

<h3>Resolution aur deployment immediacy</h3>
<p>EPG-to-domain association par do settings decide karti hain ki policy leaf tak <b>kab</b> pahunche. Yeh bade fabrics par hardware resources (VLANs, TCAM) bachane ke liye hain.</p>
<table class="cmp"><tr><th>Setting</th><th>Options</th><th>Matlab</th></tr>
<tr><td><b>Resolution immediacy</b>: policy leaf par kab download ho</td><td><b>Pre-provision</b></td><td>Un saare leaves par download jinke ports domain ka AAEP le jaate hain, koi host detect hone se pehle hi</td></tr>
<tr><td></td><td><b>Immediate</b></td><td>Tab download jab VDS se juda hypervisor leaf ke peeche discover ho (LLDP/CDP se)</td></tr>
<tr><td></td><td><b>On Demand</b></td><td>Sirf tab download jab leaf ke peeche wale host par koi VM port group se jude</td></tr>
<tr><td><b>Deployment immediacy</b>: hardware mein kab program ho</td><td><b>Immediate</b> / <b>On Demand</b></td><td>Download hote hi, ya sirf pehla packet aane par</td></tr>
</table>
<p><b>Pre-provision</b> tab use karo jab leaf ko LLDP/CDP se host milne se pehle forward karna ho: jaise VDS par khud ESXi management VMkernel, ya host aur leaf ke beech blade switch jo LLDP pass nahi karta. Static ports sirf deployment immediacy use karte hain.</p>

<pre class="out">LEAF101# show vlan extended
 VLAN Name                             Encap            Ports
 ---- -------------------------------- ---------------- ------------------------
 21   NK-PROD:WEB-BD                   vxlan-15826915   Eth1/10
 <span class="hl">22   NK-PROD:ECOM:WEB                 vlan-1003        Eth1/10</span></pre>
<p>VLAN 1003 APIC ne dynamic pool se chuna; kisi ne type nahi kiya.</p>

<h3>Microsegmentation: uSeg EPGs</h3>
<p>Normal EPG endpoints ko is hisaab se group karta hai ki woh kahan attach hote hain (port, VLAN, port group). <b>Microsegmented EPG (uSeg EPG)</b> unhe <b>attributes</b> se group karta hai: IP address ya subnet, MAC address, aur VMs ke liye VM name, guest operating system, VM custom attribute, tag, host ya datacenter bhi. uSeg EPG ko base EPG wala same BD use karna hota hai. VMware VDS ke liye base EPG ki VMM association mein microsegmentation allow honi chahiye, aur ACI phir VDS par private VLANs use karta hai taaki ek hi host par VM-to-VM traffic bhi leaf se hokar jaaye, jahan policy lag sake.</p>
<p>Do related EPG options: <b>Intra EPG Isolation</b> (enforced = same EPG ke andar endpoints aapas mein baat nahi kar sakte, backup ya PXE networks ke liye typical) aur <b>intra-EPG contracts</b> (EPG ke andar sirf specific flows allow karo).</p>

<h3>Endpoint Security Groups (ESGs)</h3>
<p>APIC release 5.0 se, <b>ESG</b> ek security-only group hai jo <b>VRF</b> scoped hai, forwarding se alag. Endpoints ESGs mein <b>selectors</b> se aate hain: tag selectors (IP ya MAC tags), EPG selectors (EPG ka sab kuch) aur IP subnet selectors. Contracts ESGs ke beech lagte hain (aur ESG aur L3Out external EPG ke beech). Kyunki ESG same VRF ke kai BDs par fail sakta hai, yeh network design se baandhe bina security groups banane ka modern tareeka hai. ESGs aur EPGs ke beech contracts nahi hote; endpoints ke har set ke liye ek model chuno.</p>

<div class="eg"><p><b>Worked example.</b> Security chahti hai ki jis VM ka naam <code>-quarantine</code> par khatam ho woh turant kat jaaye. Application profile ECOM mein uSeg EPG QUARANTINE banao, BD WEB-BD, VMM domain NK-VDS, attribute <i>VM Name ends with -quarantine</i> ke saath, aur ek remediation server wale contract ke alawa koi contract mat lagao. Jab VMware admin <code>web07</code> ko <code>web07-quarantine</code> rename karta hai, VM kuch hi seconds mein EPG WEB chhod kar QUARANTINE mein aa jaata hai; uska IP address nahi badalta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> VMM domain ke liye static VLAN pool use karna (VMM ko dynamic allocation chahiye). ESXi ki taraf wale ports ke AAEP mein VMM domain jodna bhoolna. Immediate ya On Demand resolution ke saath leaf aur host ke beech LLDP/CDP disabled chhodna, jisse leaf kabhi nahi seekhta ki host kahan hai aur EPG kabhi deploy nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Resolution immediacy ke teen options hain (Pre-provision, Immediate, On Demand); deployment immediacy ke do (Immediate, On Demand). Port group name format tenant|application profile|EPG hai. uSeg EPGs ko base EPG ka BD share karna hota hai.</p></div>

<div class="scn"><h4>Woh host jiska management reboot ke baad chala gaya</h4><p>Ek team ne har host ka ESXi management VMkernel (vmk0) APIC-managed VDS par shift kiya, resolution immediacy <i>On Demand</i> wale EPG mein. Hafton baad, ek host patching ke liye reboot hua aur vCenter mein kabhi wapas nahi aaya. Leaf par <code>show vlan extended</code> ne us port par management EPG ka koi VLAN nahi dikhaya. EPG wait kar raha tha ki vCenter host par koi VM report kare, lekin vCenter host tak pahunch hi nahi pa raha tha kyunki uska management network deploy nahi tha: murgi-anda wala loop. Management EPG ki association ko <i>Pre-provision</i> karte hi port par VLAN deploy hua, aur host reconnect ho gaya.</p><p><b>Seekh:</b> hypervisor ko vCenter se baat karne se pehle jo bhi chahiye woh Pre-provision hona chahiye.</p></div>

<div class="iv"><p class="q">"EPG ko VMware VMM domain se associate karne par kya hota hai, aur resolution immediacy kya control karti hai?"</p><p>Strong answer: APIC domain ke dynamic pool se VLAN allocate karta hai aur vCenter mein APIC-managed VDS par tenant|ap|epg naam ka port group banata hai; usse jude VMs EPG join karte hain, aur APIC vCenter inventory plus LLDP/CDP se jaanta hai ki kaunse leaf ports kin hosts tak jaate hain. Resolution immediacy decide karti hai ki policy leaf par kab download ho (Pre-provision, host discovery par Immediate, VM attach par On Demand); deployment immediacy decide karti hai ki hardware mein kab program ho. vmk0 Pre-provision ka example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VMM domain APIC ko vCenter (ya doosron) se jodta hai, dynamic VLAN pool aur APIC-managed VDS ke saath.</li>
<li>EPG + VMM domain = port group tenant|ap|epg; VMs move karne par apni policy rakhte hain.</li>
<li>Resolution immediacy: Pre-provision, Immediate, On Demand; deployment immediacy: Immediate, On Demand.</li>
<li>uSeg EPGs endpoints ko attributes (IP, MAC, VM name, OS) se classify karte hain; intra-EPG isolation EPG ke andar traffic block karta hai.</li>
<li>ESGs selectors se bane VRF-scoped security groups hain, BDs se independent.</li>
</ul></div>
`}};export{e as default};