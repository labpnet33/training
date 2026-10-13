var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Lab 2 design">
<rect x="10" y="85" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="150" y="10" width="480" height="200" rx="10" fill="#bae6fd"/><text x="164" y="32" class="svg-ink" font-size="13">vnet-nk 10.10.0.0/16</text>
<rect x="170" y="50" width="250" height="140" rx="8" fill="#bbf7d0"/><text x="295" y="72" text-anchor="middle" class="svg-ink" font-size="13">snet-web 10.10.1.0/24</text>
<rect x="190" y="90" width="210" height="80" rx="6" fill="#fde68a"/><text x="295" y="115" text-anchor="middle" class="svg-ink" font-size="12">vm-web (NIC 10.10.1.4)</text><text x="295" y="135" text-anchor="middle" class="svg-muted" font-size="11">Standard public IP pip-web</text><text x="295" y="153" text-anchor="middle" class="svg-muted" font-size="11">no NSG yet: inbound closed</text>
<rect x="450" y="50" width="160" height="140" rx="8" fill="#ddd6fe"/><text x="530" y="72" text-anchor="middle" class="svg-ink" font-size="13">snet-app</text><text x="530" y="120" text-anchor="middle" class="svg-muted" font-size="11">empty</text>
<line x1="110" y1="110" x2="190" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="140" y="100" class="svg-accent" font-size="11">blocked</text>
</svg>`,t={id:`guided-lab-vm-public-ip-routes`,h:{en:`Guided lab 2 on your own Azure account: a VM, a Standard public IP and effective routes`,hi:`Guided lab 2 apne Azure account par: VM, Standard public IP aur effective routes`},body:{en:`
<h3>Goal</h3>
<p>Place one small VM in snet-web with a Standard public IP, then read its private IP, public IP and effective routes, and observe that the Standard public IP is closed by default. Then delete everything promptly. This lab has a real, small cost, so keep it short.</p>

<h3>Prerequisites</h3>
<ul>
<li>Lab 1 of this module understood (you can rebuild vnet-nk in two commands).</li>
<li>A budget alert set. SSH client optional; we do not log in.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: a VM bills per second or hour while it is allocated, based on its size and region. Its OS disk bills by disk size and tier for as long as it exists. A Standard public IP bills per hour while it exists (verify on the pricing page). The VNet, subnets, NIC and route tables do not bill. As an <b>assumed example for planning only</b>, a small burstable B-series Linux VM plus disk plus Standard IP for one hour is a few US cents. Run the lab for an hour and delete it. Check the pricing calculator for your region before you start.</p>

<div class="dia">`+e+`<p class="cap">One VM, one Standard public IP. With no NSG, inbound from the Internet is blocked.</p></div>

<h3>Steps</h3>

<h4>Step 1. Rebuild the base network</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname delete-after=today
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24</pre>

<h4>Step 2. Create a Standard public IP</h4>
<p>Portal: Public IP addresses, Create, name pip-web, SKU Standard, assignment Static, Central India (verify wording).</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia</pre>

<h4>Step 3. Create the VM in snet-web</h4>
<p>Portal: Virtual machines, Create, resource group rg-nk-lab, name vm-web, region Central India, a small Linux image and a small size that your subscription offers, authentication SSH key. On Networking choose vnet-nk, snet-web, public IP pip-web, and set NIC network security group to <b>None</b> (verify wording).</p>
<pre class="code">az vm create -g rg-nk-lab -n vm-web --image Ubuntu2204 --size Standard_B1s \\
  --vnet-name vnet-nk --subnet snet-web \\
  --public-ip-address pip-web --nsg "" \\
  --admin-username azureuser --generate-ssh-keys</pre>
<p>The image alias, size and the empty NSG option can differ by CLI version and region availability. If the size is not available, list sizes with <code>az vm list-skus -l centralindia --output table</code> and choose another small one (verify before publishing).</p>

<h4>Step 4. Read the addresses</h4>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -n vm-web --output table
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.4</pre>
<p>Illustrative output:</p>
<pre class="out">VirtualMachine    PublicIPAddresses    PrivateIPAddresses
----------------  -------------------  --------------------
vm-web            <span class="hl">203.0.113.25</span>         <span class="hl">10.10.1.4</span></pre>
<p>The public address shown is a documentation address; yours will differ. The private address is the first usable one, .4.</p>

<h4>Step 5. Read the effective routes</h4>
<p>Portal: open the NIC of vm-web, Effective routes (verify wording). The VM must be running.</p>
<pre class="code">az network nic list -g rg-nk-lab --query "[].name" --output tsv
az network nic show-effective-route-table -g rg-nk-lab -n vm-webVMNic --output table</pre>
<p>The NIC name is generated by az vm create (often the VM name plus VMNic). Use the name returned by the first command.</p>
<pre class="out">Source    State    Address Prefix    Next Hop Type
--------  -------  ----------------  ---------------
Default   Active   10.10.0.0/16      VnetLocal
Default   Active   0.0.0.0/0         Internet
Default   Active   10.0.0.0/8        None</pre>

<h4>Step 6. Observe the closed Standard public IP</h4>
<p>From your laptop try a TCP connection to the VM public IP on port 22 (for example <code>nc -vz -w 5 203.0.113.25 22</code> with your real address). It times out, even though the VM runs sshd, because a Standard public IP is closed until an NSG allows traffic. You will fix this properly in the next module with an NSG rule.</p>

<h3>Verification</h3>
<ul>
<li>Private IP is 10.10.1.4 inside snet-web.</li>
<li>Effective routes show VnetLocal for 10.10.0.0/16 and Internet for 0.0.0.0/0.</li>
<li>The connection from the Internet to port 22 fails.</li>
</ul>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p>Wait for <code>false</code>. The group delete removes the VM, the disk, the NIC and the public IP together. Check Cost Management tomorrow.</p>

<h3>What bills you: trap list</h3>
<ul>
<li><b>The VM</b> while allocated. Stopping inside the guest OS does not stop billing; you must <b>deallocate</b> it (portal Stop, or <code>az vm deallocate</code>).</li>
<li><b>The OS disk</b> bills even when the VM is deallocated (verify).</li>
<li><b>The Standard public IP</b> bills hourly even unattached (verify).</li>
<li><b>Auto-created extras</b> such as NSGs and diagnostics storage when you accept wizard defaults.</li>
<li><b>Left-over resources in other groups</b> from earlier experiments.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Choosing a large VM size because the wizard defaulted to it. For this lab use the smallest size you can find. Another: leaving the VM running over the weekend because the tab was closed.</p></div>

<div class="exam"><p><b>Exam trap.</b> A stopped VM (OS shutdown) still holds its compute allocation and bills; a deallocated VM releases compute and stops compute billing but keeps its disks. The public IP and disks continue to bill (verify).</p></div>

<div class="scn"><h4>The weekend VM</h4><p>A trainee shut down Linux from inside the OS on Friday and left the VM allocated. The budget alert warned him on Sunday evening. He opened the portal, saw status "Stopped" instead of "Stopped (deallocated)", deallocated it, then deleted the resource group on Monday.</p><p><b>Lesson:</b> shutting down the OS is not the same as deallocating the VM.</p></div>

<div class="iv"><p class="q">"What is the difference between stopped and deallocated in Azure?"</p><p>Stopped from inside the OS leaves the VM allocated on a host, so compute keeps billing. Deallocated releases compute and stops compute billing. Disks and Standard public IPs still bill.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NIC gets a private IP from the subnet; the first is .4.</li>
<li>Effective routes show VnetLocal for the VNet and Internet for 0.0.0.0/0.</li>
<li>Standard public IPs are closed by default; an NSG must allow inbound traffic.</li>
<li>Deallocate, do not just shut down, and delete the group to stop all billing.</li>
<li>Cost comes from VM, disk and public IP, not from the VNet.</li>
</ul></div>
`,hi:`
<h3>Goal</h3>
<p>snet-web mein Standard public IP ke saath ek chhota VM rakho, phir uska private IP, public IP aur effective routes padho, aur dekho ki Standard public IP default mein closed hai. Phir sab jaldi delete karo. Is lab ka asli, chhota cost hai, isliye ise chhota rakho.</p>

<h3>Prerequisites</h3>
<ul>
<li>Is module ka lab 1 samjha hua (aap vnet-nk ko do commands mein dobara bana sakte ho).</li>
<li>Budget alert set. SSH client optional; hum login nahi karte.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure: VM jab tak allocated hai tab tak size aur region ke hisaab se per second ya hour bill hota hai. Uski OS disk jab tak exist karti hai disk size aur tier ke hisaab se bill hoti hai. Standard public IP jab tak exist karta hai per hour bill hota hai (pricing page par verify karo). VNet, subnets, NIC aur route tables bill nahi hote. <b>Sirf planning ke liye assumed example</b> ke taur par, ek ghante ke liye chhota burstable B-series Linux VM plus disk plus Standard IP kuch US cents hota hai. Lab ek ghanta chalao aur delete karo. Shuru karne se pehle apne region ke liye pricing calculator dekho.</p>

<div class="dia">`+e+`<p class="cap">Ek VM, ek Standard public IP. NSG ke bina Internet se inbound blocked hai.</p></div>

<h3>Steps</h3>

<h4>Step 1. Base network dobara banao</h4>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname delete-after=today
az network vnet create -g rg-nk-lab -n vnet-nk --location centralindia --address-prefixes 10.10.0.0/16 --subnet-name snet-web --subnet-prefixes 10.10.1.0/24
az network vnet subnet create -g rg-nk-lab --vnet-name vnet-nk -n snet-app --address-prefixes 10.10.2.0/24</pre>

<h4>Step 2. Standard public IP banao</h4>
<p>Portal: Public IP addresses, Create, naam pip-web, SKU Standard, assignment Static, Central India (verify wording).</p>
<pre class="code">az network public-ip create -g rg-nk-lab -n pip-web --sku Standard --allocation-method Static --location centralindia</pre>

<h4>Step 3. snet-web mein VM banao</h4>
<p>Portal: Virtual machines, Create, resource group rg-nk-lab, naam vm-web, region Central India, chhota Linux image aur aisa chhota size jo aapki subscription offer kare, authentication SSH key. Networking par vnet-nk, snet-web, public IP pip-web chuno, aur NIC network security group <b>None</b> set karo (verify wording).</p>
<pre class="code">az vm create -g rg-nk-lab -n vm-web --image Ubuntu2204 --size Standard_B1s \\
  --vnet-name vnet-nk --subnet snet-web \\
  --public-ip-address pip-web --nsg "" \\
  --admin-username azureuser --generate-ssh-keys</pre>
<p>Image alias, size aur khali NSG option CLI version aur region availability ke hisaab se alag ho sakte hain. Agar size available nahi hai to <code>az vm list-skus -l centralindia --output table</code> se sizes list karo aur doosra chhota chuno (verify before publishing).</p>

<h4>Step 4. Addresses padho</h4>
<pre class="code">az vm list-ip-addresses -g rg-nk-lab -n vm-web --output table
az network vnet check-ip-address -g rg-nk-lab -n vnet-nk --ip-address 10.10.1.4</pre>
<p>Illustrative output:</p>
<pre class="out">VirtualMachine    PublicIPAddresses    PrivateIPAddresses
----------------  -------------------  --------------------
vm-web            <span class="hl">203.0.113.25</span>         <span class="hl">10.10.1.4</span></pre>
<p>Dikhaya gaya public address documentation address hai; aapka alag hoga. Private address pehla usable hai, .4.</p>

<h4>Step 5. Effective routes padho</h4>
<p>Portal: vm-web ka NIC kholo, Effective routes (verify wording). VM running hona chahiye.</p>
<pre class="code">az network nic list -g rg-nk-lab --query "[].name" --output tsv
az network nic show-effective-route-table -g rg-nk-lab -n vm-webVMNic --output table</pre>
<p>NIC ka naam az vm create banata hai (aksar VM ka naam plus VMNic). Pehli command ka returned naam use karo.</p>
<pre class="out">Source    State    Address Prefix    Next Hop Type
--------  -------  ----------------  ---------------
Default   Active   10.10.0.0/16      VnetLocal
Default   Active   0.0.0.0/0         Internet
Default   Active   10.0.0.0/8        None</pre>

<h4>Step 6. Closed Standard public IP observe karo</h4>
<p>Laptop se VM ke public IP par port 22 par TCP connection try karo (jaise <code>nc -vz -w 5 203.0.113.25 22</code>, apne asli address ke saath). Woh time out hota hai, chahe VM par sshd chal raha ho, kyunki Standard public IP tab tak closed hai jab tak NSG traffic allow na kare. Aap ise agle module mein NSG rule se theek se fix karoge.</p>

<h3>Verification</h3>
<ul>
<li>Private IP snet-web ke andar 10.10.1.4 hai.</li>
<li>Effective routes 10.10.0.0/16 ke liye VnetLocal aur 0.0.0.0/0 ke liye Internet dikhate hain.</li>
<li>Internet se port 22 par connection fail hota hai.</li>
</ul>

<h3>Mandatory cleanup</h3>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
az group exists --name rg-nk-lab</pre>
<p><code>false</code> tak ruko. Group delete VM, disk, NIC aur public IP ko saath hata deta hai. Kal Cost Management check karo.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>VM</b> jab tak allocated hai. Guest OS ke andar se stop karne se billing nahi rukti; use <b>deallocate</b> karna padta hai (portal Stop, ya <code>az vm deallocate</code>).</li>
<li><b>OS disk</b> VM deallocated hone par bhi bill hoti hai (verify).</li>
<li><b>Standard public IP</b> unattached hone par bhi hourly bill hota hai (verify).</li>
<li><b>Auto-created extras</b> jaise NSGs aur diagnostics storage jab aap wizard defaults accept karte ho.</li>
<li><b>Doosre groups ke bache resources</b> pichle experiments se.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Bada VM size chunna kyunki wizard ne wahi default kiya tha. Is lab ke liye sabse chhota size use karo jo mile. Ek aur: tab band hone ki wajah se VM weekend bhar chalta chhod dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stopped VM (OS shutdown) apna compute allocation rakhta hai aur bill hota hai; deallocated VM compute chhodta hai aur compute billing rokta hai lekin disks rakhta hai. Public IP aur disks bill hote rehte hain (verify).</p></div>

<div class="scn"><h4>Weekend ka VM</h4><p>Ek trainee ne Friday ko Linux ko OS ke andar se shut down kiya aur VM allocated chhod diya. Budget alert ne use Sunday shaam ko warn kiya. Usne portal kholkar dekha ki status "Stopped (deallocated)" ki jagah "Stopped" hai, use deallocate kiya, phir Monday ko resource group delete kiya.</p><p><b>Lesson:</b> OS shut down karna aur VM deallocate karna ek jaisa nahi hai.</p></div>

<div class="iv"><p class="q">"Azure mein stopped aur deallocated mein kya farak hai?"</p><p>OS ke andar se stopped VM host par allocated rehta hai, isliye compute billing chalti rehti hai. Deallocated compute chhodta hai aur compute billing rokta hai. Disks aur Standard public IPs phir bhi bill hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIC ko subnet se private IP milta hai; pehla .4 hai.</li>
<li>Effective routes VNet ke liye VnetLocal aur 0.0.0.0/0 ke liye Internet dikhate hain.</li>
<li>Standard public IPs default mein closed hain; NSG ko inbound allow karna padta hai.</li>
<li>Sirf shut down nahi, deallocate karo, aur saari billing rokne ke liye group delete karo.</li>
<li>Cost VM, disk aur public IP se aati hai, VNet se nahi.</li>
</ul></div>
`}};export{t as default};