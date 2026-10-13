var e=`<svg viewBox="0 0 640 260" role="img" aria-label="NSG evaluation order inbound and outbound">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Inbound: subnet NSG first, then NIC NSG</text>
<rect x="10" y="35" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="150" y="35" width="150" height="50" rx="8" fill="#fde68a"/><text x="225" y="58" text-anchor="middle" class="svg-ink" font-size="12">1 Subnet NSG</text><text x="225" y="74" text-anchor="middle" class="svg-muted" font-size="11">allow or deny</text>
<rect x="350" y="35" width="150" height="50" rx="8" fill="#fed7aa"/><text x="425" y="58" text-anchor="middle" class="svg-ink" font-size="12">2 NIC NSG</text><text x="425" y="74" text-anchor="middle" class="svg-muted" font-size="11">allow or deny</text>
<rect x="540" y="35" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="585" y="65" text-anchor="middle" class="svg-ink" font-size="12">VM</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="60" x2="150" y2="60"/><line x1="300" y1="60" x2="350" y2="60"/><line x1="500" y1="60" x2="540" y2="60"/></g>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Outbound: NIC NSG first, then subnet NSG</text>
<rect x="10" y="140" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="170" text-anchor="middle" class="svg-ink" font-size="12">VM</text>
<rect x="150" y="140" width="150" height="50" rx="8" fill="#fed7aa"/><text x="225" y="163" text-anchor="middle" class="svg-ink" font-size="12">1 NIC NSG</text><text x="225" y="179" text-anchor="middle" class="svg-muted" font-size="11">allow or deny</text>
<rect x="350" y="140" width="150" height="50" rx="8" fill="#fde68a"/><text x="425" y="163" text-anchor="middle" class="svg-ink" font-size="12">2 Subnet NSG</text><text x="425" y="179" text-anchor="middle" class="svg-muted" font-size="11">allow or deny</text>
<rect x="540" y="140" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="170" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="165" x2="150" y2="165"/><line x1="300" y1="165" x2="350" y2="165"/><line x1="500" y1="165" x2="540" y2="165"/></g>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">Traffic must be allowed at BOTH levels. A deny at either level drops it.</text>
</svg>`,t={id:`subnet-vs-nic-evaluation`,h:{en:`Subnet NSG versus NIC NSG: evaluation order and effective rules`,hi:`Subnet NSG versus NIC NSG: evaluation order aur effective rules`},body:{en:`
<h3>Two possible attachment points</h3>
<p>An NSG can be associated with a <b>subnet</b>, with a <b>NIC</b>, or with both. The result is that a packet may be examined by two NSGs. Most confusion about "the rule is there but it still does not work" comes from forgetting the other one.</p>

<h3>The order</h3>
<ul>
<li><b>Inbound traffic:</b> evaluated by the NSG on the <b>subnet</b> first. If allowed, then by the NSG on the <b>NIC</b>. If either denies, the packet is dropped.</li>
<li><b>Outbound traffic:</b> evaluated by the NSG on the <b>NIC</b> first, then by the NSG on the <b>subnet</b>.</li>
</ul>
<p>Think of it as outer ring to inner ring on the way in, and inner to outer on the way out. Traffic needs an allow at <b>both</b> levels where an NSG exists. A Deny at either level wins.</p>

<div class="dia">`+e+`<p class="cap">Inbound meets the subnet NSG first; outbound meets the NIC NSG first.</p></div>

<h3>Intra-subnet traffic is filtered too</h3>
<p>When two VMs are in the same subnet, and the subnet has an NSG, traffic between them is evaluated by that NSG, because the rules apply to traffic entering and leaving each NIC in the subnet. The default AllowVnetInBound allows it, but a custom deny can block it. This is a frequent surprise for people who think the subnet is a flat trusted zone.</p>

<h3>Which one should you use?</h3>
<table class="cmp"><tr><th>Approach</th><th>When it fits</th></tr>
<tr><td>NSG on the subnet only</td><td>The usual recommendation: one place to manage rules for a tier, simple to audit.</td></tr>
<tr><td>NSG on the NIC only</td><td>VMs in the same subnet need different rules. Harder to manage at scale.</td></tr>
<tr><td>Both</td><td>Layered control, for example a platform team's subnet NSG plus an application team's NIC NSG. Then remember both must allow.</td></tr>
</table>
<p>A rule of thumb for beginners: use <b>one NSG per subnet</b>, use ASGs to give different VMs different treatment, and avoid NIC-level NSGs unless there is a clear reason. Note that some Azure services need specific NSG rules and some subnets (GatewaySubnet) must not have an NSG (verify before publishing).</p>

<h3>Effective security rules: the real answer</h3>
<p>The rule list of one NSG is not the whole story. The <b>effective security rules</b> of a NIC combine the subnet NSG and the NIC NSG. In the portal open the NIC, then Effective security rules (verify wording). The VM must be running.</p>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --output json</pre>
<p>Illustrative output, shortened:</p>
<pre class="out">{
  "value": [
    { "association": { "subnet": { "id": ".../subnets/snet-web" } },
      "networkSecurityGroup": { "id": ".../networkSecurityGroups/nsg-web" },
      "effectiveSecurityRules": [
        { "name": "securityRules/AllowHttps", "priority": <span class="hl">100</span>, "access": "Allow", "direction": "Inbound", "destinationPortRange": "443-443" },
        { "name": "defaultSecurityRules/DenyAllInBound", "priority": 65500, "access": "Deny" }
      ] }
  ]
}</pre>

<h3>Network Watcher IP flow verify</h3>
<p>Instead of reading every rule, ask the platform: "would this packet be allowed?"</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:443 --remote 203.0.113.50:50000</pre>
<pre class="out">Access: <span class="hl">Allow</span>
RuleName: securityRules/AllowHttps  (or the name of the rule that matched, with its NSG)</pre>
<p>IP flow verify names the rule that decided the result, which is exactly what you want during a ticket. It needs Network Watcher in the region and an agent extension on the VM (verify before publishing). NSG diagnostics, a newer Network Watcher tool, evaluates a flow across all NSGs on the path (verify before publishing).</p>

<div class="eg"><p><b>Worked example.</b> snet-web has nsg-web: allow TCP 443 from Internet (100). The NIC of vm-web has nsg-nic: allow only TCP 22 (100) and nothing else custom. A browser sends TCP 443. The subnet NSG allows it. The NIC NSG has no 443 allow and its DenyAllInBound drops it. Result: the site is down although "the NSG has the rule". The fix is to add 443 to the NIC NSG or, better, remove the NIC NSG.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing the subnet NSG for hours while an old NIC-level NSG created by the VM wizard is the one denying. The portal VM wizard can create a basic NIC NSG automatically when you pick the "Basic" option (verify wording).</p></div>

<div class="exam"><p><b>Exam trap.</b> Inbound: subnet then NIC. Outbound: NIC then subnet. Both must allow. An NSG on a subnet filters intra-subnet traffic as well.</p></div>

<div class="scn"><h4>Two NSGs, one denied</h4><p>An application team asked for TCP 8443 to be opened. The platform team added the rule at the subnet NSG and confirmed it. Users still timed out. Effective security rules for the VM NIC showed a second NSG, created long ago with the VM, with no 8443 rule. They removed the NIC NSG and kept the subnet NSG as the single control.</p><p><b>Lesson:</b> use effective security rules, not one NSG's list, as the source of truth.</p></div>

<div class="iv"><p class="q">"A subnet NSG and a NIC NSG both exist. In what order are they evaluated?"</p><p>Inbound: subnet NSG first, then NIC NSG. Outbound: NIC NSG first, then subnet NSG. Traffic must be allowed by each. Say you simplify to one NSG per subnet and use effective security rules or IP flow verify to check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound: subnet NSG then NIC NSG; outbound: NIC NSG then subnet NSG.</li>
<li>Both levels must allow; a deny anywhere drops the packet.</li>
<li>Subnet NSGs also filter traffic between VMs in the same subnet.</li>
<li>Prefer one NSG per subnet plus ASGs.</li>
<li>Check effective security rules and IP flow verify.</li>
</ul></div>
`,hi:`
<h3>Do possible attachment points</h3>
<p>NSG <b>subnet</b>, <b>NIC</b>, ya dono se associate ho sakta hai. Nateeja yeh ki ek packet ko do NSGs examine kar sakte hain. "Rule hai phir bhi kaam nahi karta" ka zyadatar confusion doosre NSG ko bhool jane se aata hai.</p>

<h3>Order</h3>
<ul>
<li><b>Inbound traffic:</b> pehle <b>subnet</b> ke NSG se evaluate hota hai. Allow ho to phir <b>NIC</b> ke NSG se. Dono mein se koi deny kare to packet drop.</li>
<li><b>Outbound traffic:</b> pehle <b>NIC</b> ke NSG se evaluate hota hai, phir <b>subnet</b> ke NSG se.</li>
</ul>
<p>Isse aise socho: andar aate waqt bahar ki ring se andar ki ring, aur bahar jaate waqt andar se bahar. Jahan bhi NSG hai wahan <b>dono</b> levels par allow chahiye. Kisi bhi level ka Deny jeetta hai.</p>

<div class="dia">`+e+`<p class="cap">Inbound pehle subnet NSG se milta hai; outbound pehle NIC NSG se.</p></div>

<h3>Intra-subnet traffic bhi filter hota hai</h3>
<p>Jab do VMs same subnet mein hain, aur subnet par NSG hai, to unke beech ka traffic us NSG se evaluate hota hai, kyunki rules subnet ke har NIC mein aane aur jaane wale traffic par lagte hain. Default AllowVnetInBound ise allow karta hai, lekin custom deny block kar sakta hai. Jo log subnet ko flat trusted zone samajhte hain unke liye yeh aam surprise hai.</p>

<h3>Kaun sa use karna chahiye?</h3>
<table class="cmp"><tr><th>Approach</th><th>Kab fit hota hai</th></tr>
<tr><td>Sirf subnet par NSG</td><td>Aam recommendation: tier ke rules manage karne ki ek jagah, audit karna simple.</td></tr>
<tr><td>Sirf NIC par NSG</td><td>Same subnet ke VMs ko alag rules chahiye. Scale par manage karna mushkil.</td></tr>
<tr><td>Dono</td><td>Layered control, jaise platform team ka subnet NSG plus application team ka NIC NSG. Tab yaad rakho dono ko allow karna padega.</td></tr>
</table>
<p>Beginners ke liye rule of thumb: <b>har subnet ke liye ek NSG</b> use karo, alag VMs ko alag treatment dene ke liye ASGs use karo, aur clear wajah ke bina NIC-level NSGs se bacho. Dhyan rahe ki kuch Azure services ko specific NSG rules chahiye aur kuch subnets (GatewaySubnet) par NSG nahi hona chahiye (verify before publishing).</p>

<h3>Effective security rules: asli jawab</h3>
<p>Ek NSG ki rule list poori kahani nahi hai. NIC ke <b>effective security rules</b> subnet NSG aur NIC NSG ko jodte hain. Portal mein NIC kholo, phir Effective security rules (verify wording). VM running hona chahiye.</p>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --output json</pre>
<p>Illustrative output, chhota kiya hua:</p>
<pre class="out">{
  "value": [
    { "association": { "subnet": { "id": ".../subnets/snet-web" } },
      "networkSecurityGroup": { "id": ".../networkSecurityGroups/nsg-web" },
      "effectiveSecurityRules": [
        { "name": "securityRules/AllowHttps", "priority": <span class="hl">100</span>, "access": "Allow", "direction": "Inbound", "destinationPortRange": "443-443" },
        { "name": "defaultSecurityRules/DenyAllInBound", "priority": 65500, "access": "Deny" }
      ] }
  ]
}</pre>

<h3>Network Watcher IP flow verify</h3>
<p>Har rule padhne ki jagah platform se pucho: "kya yeh packet allow hoga?"</p>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP \\
  --local 10.10.1.4:443 --remote 203.0.113.50:50000</pre>
<pre class="out">Access: <span class="hl">Allow</span>
RuleName: securityRules/AllowHttps  (ya us rule ka naam jo match hua, uske NSG ke saath)</pre>
<p>IP flow verify us rule ka naam batata hai jisne result decide kiya, jo ticket ke dauran bilkul wahi hai jo aapko chahiye. Ise region mein Network Watcher aur VM par agent extension chahiye (verify before publishing). NSG diagnostics, ek naya Network Watcher tool, path ke saare NSGs mein flow evaluate karta hai (verify before publishing).</p>

<div class="eg"><p><b>Worked example.</b> snet-web ka nsg-web: Internet se TCP 443 allow (100). vm-web ke NIC ka nsg-nic: sirf TCP 22 allow (100) aur kuch custom nahi. Browser TCP 443 bhejta hai. Subnet NSG allow karta hai. NIC NSG mein 443 allow nahi hai aur uska DenyAllInBound drop karta hai. Result: site down hai jabki "NSG mein rule hai". Fix hai NIC NSG mein 443 add karna ya, behtar, NIC NSG hata dena.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ghanton subnet NSG edit karna jabki VM wizard ka banaya purana NIC-level NSG hi deny kar raha hai. Portal VM wizard "Basic" option chunne par basic NIC NSG apne aap bana sakta hai (verify wording).</p></div>

<div class="exam"><p><b>Exam trap.</b> Inbound: subnet phir NIC. Outbound: NIC phir subnet. Dono ko allow karna chahiye. Subnet par NSG intra-subnet traffic bhi filter karta hai.</p></div>

<div class="scn"><h4>Do NSGs, ek ne deny kiya</h4><p>Ek application team ne TCP 8443 kholne ko kaha. Platform team ne subnet NSG mein rule add kiya aur confirm kiya. Users phir bhi time out hue. VM NIC ke effective security rules ne doosra NSG dikhaya, jo VM ke saath bahut pehle bana tha, aur usme 8443 ka rule nahi tha. Unhone NIC NSG hataya aur subnet NSG ko single control rakha.</p><p><b>Lesson:</b> ek NSG ki list nahi, effective security rules ko source of truth maano.</p></div>

<div class="iv"><p class="q">"Subnet NSG aur NIC NSG dono hain. Kis order mein evaluate hote hain?"</p><p>Inbound: pehle subnet NSG, phir NIC NSG. Outbound: pehle NIC NSG, phir subnet NSG. Har ek se traffic allow hona chahiye. Bolo ki aap har subnet ke liye ek NSG tak simplify karte ho aur check karne ke liye effective security rules ya IP flow verify use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound: subnet NSG phir NIC NSG; outbound: NIC NSG phir subnet NSG.</li>
<li>Dono levels allow karein; kahin bhi deny packet drop karta hai.</li>
<li>Subnet NSGs same subnet ke VMs ke beech ka traffic bhi filter karte hain.</li>
<li>Har subnet ke liye ek NSG plus ASGs prefer karo.</li>
<li>Effective security rules aur IP flow verify check karo.</li>
</ul></div>
`}};export{t as default};