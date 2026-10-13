var e={id:`kubernetes`,h:{en:`Kubernetes and container orchestration (concepts)`,hi:`Kubernetes aur container orchestration (concepts)`},body:{en:`
<p>Running three containers by hand is easy. Running three thousand across fifty servers is like managing a port with thousands of shipping containers arriving every hour: someone must decide which ship each box goes on, notice when a crane breaks, move boxes to another crane, and keep a register of where everything is. In the container world that harbour master is an <b>orchestrator</b>, and the dominant one is <b>Kubernetes</b> (often written K8s).</p>

<h3>What an orchestrator does</h3>
<ul>
<li><b>Scheduling</b>: decides which server runs each container, based on free CPU and memory.</li>
<li><b>Self-healing</b>: if a container or a whole server dies, it starts replacements elsewhere.</li>
<li><b>Scaling</b>: runs more copies when load rises and fewer when it falls.</li>
<li><b>Rolling updates</b>: replaces old versions with new ones a few at a time, with rollback if something breaks.</li>
<li><b>Service discovery and load balancing</b>: gives a group of identical containers one stable name and IP, even though the containers behind it come and go.</li>
</ul>
<p>You describe the <b>desired state</b> ("I want 3 copies of web version 2") in a file, and Kubernetes continuously works to make the real state match it. This declarative model is the same idea you will meet again in network automation.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Cluster</dt><dd>A set of machines (physical servers or, very often, VMs) managed as one.</dd>
<dt>Control plane</dt><dd>The brain: the <b>API server</b> (everything talks to it, including the <code>kubectl</code> command), <b>etcd</b> (the key-value database holding the cluster state), the <b>scheduler</b> and the <b>controllers</b> that compare desired and actual state.</dd>
<dt>Worker node</dt><dd>A machine that runs workloads. Each has a container runtime, the <b>kubelet</b> agent that starts and watches containers, and <b>kube-proxy</b>, which programs forwarding rules for services.</dd>
<dt>Pod</dt><dd>The smallest unit Kubernetes schedules: one or more containers that share <b>one IP address</b> and are always placed together.</dd>
<dt>Deployment</dt><dd>Declares how many replicas of a pod should run and which image version; handles scaling and rolling updates.</dd>
<dt>Service</dt><dd>A stable virtual IP and DNS name in front of a changing set of pods, with built-in load balancing.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Kubernetes cluster">
<rect x="220" y="14" width="200" height="56" rx="8" fill="#fed7aa"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">API server, etcd, scheduler</text>
<line x1="260" y1="70" x2="160" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="380" y1="70" x2="480" y2="110" stroke="#64748b" stroke-width="1.5"/>
<rect x="40" y="110" width="240" height="110" rx="8" fill="#bae6fd"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="13">worker1 (a VM)</text>
<rect x="56" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="104" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="104" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.1.12</text>
<rect x="168" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="216" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod api</text><text x="216" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.1.13</text>
<text x="160" y="206" text-anchor="middle" class="svg-muted" font-size="12">kubelet, kube-proxy</text>
<rect x="360" y="110" width="240" height="110" rx="8" fill="#bae6fd"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="13">worker2 (a VM)</text>
<rect x="376" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="424" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="424" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.2.7</text>
<rect x="488" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="536" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="536" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.2.8</text>
<text x="480" y="206" text-anchor="middle" class="svg-muted" font-size="12">kubelet, kube-proxy</text>
<rect x="170" y="238" width="300" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="259" text-anchor="middle" class="svg-ink" font-size="12">Service web: 10.96.120.15, one stable IP</text>
</svg><p class="cap">Pods get their own IPs on every node; a service gives the three web pods one stable address.</p></div>

<h3>Kubernetes networking in four rules</h3>
<ol>
<li>Every pod gets its <b>own IP address</b> from a pod network (for example 10.244.0.0/16, a per-node slice such as 10.244.1.0/24).</li>
<li>Every pod can reach every other pod <b>without NAT</b>, on any node.</li>
<li>The pod network is built by a <b>CNI plugin</b> (Container Network Interface), such as Calico, Flannel or Cilium. Some route pod subnets with BGP to the physical network; others build overlay tunnels (VXLAN) between nodes.</li>
<li><b>Services</b> provide stable access: <b>ClusterIP</b> (internal virtual IP only), <b>NodePort</b> (a port in the range 30000-32767 opened on every node), and <b>LoadBalancer</b> (asks a cloud or an on-premises load balancer for an external IP).</li>
</ol>

<pre class="out">$ kubectl get pods -o wide
NAME                   READY   STATUS    RESTARTS   AGE   IP            NODE
web-7c9d8f6b5-4xkqz    1/1     Running   0          2m    <span class="hl">10.244.1.12</span>   worker1
web-7c9d8f6b5-m2p8d    1/1     Running   0          2m    10.244.2.7    worker2
web-7c9d8f6b5-t9wzc    1/1     Running   0          2m    10.244.2.8    worker2

$ kubectl get svc web
NAME   TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
<span class="hl">web    NodePort   10.96.120.15   &lt;none&gt;        80:30080/TCP   2m</span></pre>

<div class="eg"><p><b>Worked example.</b> The deployment asks for 3 web replicas. worker1 crashes, taking pod 10.244.1.12 with it. Within seconds the controller sees 2 running instead of 3, and the scheduler starts a new pod on worker2 with a new IP, say 10.244.2.9. Clients never noticed, because they talk to the service 10.96.120.15 (or to any node on port 30080), and the service's backend list updated automatically.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hard-coding a pod IP in a firewall rule or an application setting. Pods are disposable and change IP whenever they are recreated. Point to the service, or permit the whole pod range.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA only expects the concept: Kubernetes is a <b>container orchestrator</b> that schedules, scales and heals containers across a cluster. It is not a hypervisor and not a container engine; it uses a runtime such as containerd underneath.</p></div>

<div class="scn"><h4>The pod range nobody routed</h4><p>A team installed a Kubernetes cluster with a CNI plugin that advertises pod subnets to the data center switches using BGP. Pods could reach each other, but not the database VLAN. The leaf switches had no BGP peering configured with the nodes, so they had no route back to 10.244.0.0/16. Adding the peering (or, alternatively, SNAT at the nodes) fixed it.</p><p><b>Lesson:</b> Kubernetes adds new IP ranges to your network. Plan how they are routed or translated, like any other subnet.</p></div>

<div class="iv"><p class="q">"What is Kubernetes, and why would a company use it?"</p><p>Kubernetes is an open-source container orchestrator. You declare the desired state and it schedules pods across a cluster of nodes, restarts failed ones, scales replicas and performs rolling updates. Name the pieces: control plane (API server, etcd, scheduler), worker nodes (kubelet, kube-proxy, runtime), pods, deployments and services. From a network view, each pod gets its own IP via a CNI plugin, and services give stable virtual IPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kubernetes orchestrates containers: scheduling, self-healing, scaling, rolling updates and service discovery.</li>
<li>Control plane = API server, etcd, scheduler, controllers; worker nodes run kubelet, kube-proxy and a container runtime.</li>
<li>A pod is one or more containers sharing one IP; a deployment keeps N replicas running.</li>
<li>Every pod gets a routable IP from the CNI plugin and reaches other pods without NAT.</li>
<li>Services (ClusterIP, NodePort 30000-32767, LoadBalancer) give stable access to changing pods.</li>
</ul></div>
`,hi:`
<p>Teen containers haath se chalana aasaan hai. Pachaas servers par teen hazaar chalana ek aise port ko manage karne jaisa hai jahan har ghante hazaaron shipping containers aate hain: kisi ko decide karna hai ki har box kis ship par jaaye, notice karna hai jab crane toot jaaye, boxes ko doosri crane par le jaana hai, aur har cheez kahan hai uska register rakhna hai. Container duniya mein woh harbour master ek <b>orchestrator</b> hai, aur sabse bada <b>Kubernetes</b> hai (aksar K8s likha jaata hai).</p>

<h3>Orchestrator kya karta hai</h3>
<ul>
<li><b>Scheduling</b>: free CPU aur memory ke hisaab se decide karta hai ki kaunsa server kaunsa container chalaye.</li>
<li><b>Self-healing</b>: agar container ya poora server mar jaaye, to kahin aur replacements start karta hai.</li>
<li><b>Scaling</b>: load badhne par zyada copies aur ghatne par kam chalata hai.</li>
<li><b>Rolling updates</b>: purane versions ko naye versions se thode thode karke badalta hai, kuch tootne par rollback ke saath.</li>
<li><b>Service discovery aur load balancing</b>: identical containers ke group ko ek stable naam aur IP deta hai, bhale hi uske peeche ke containers aate jaate rahein.</li>
</ul>
<p>Aap ek file mein <b>desired state</b> describe karte ho ("mujhe web version 2 ki 3 copies chahiye"), aur Kubernetes lagatar real state ko usse match karane mein laga rehta hai. Yeh declarative model wahi idea hai jo aap network automation mein phir milega.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Cluster</dt><dd>Machines ka set (physical servers ya, bahut baar, VMs) jo ek ki tarah manage hota hai.</dd>
<dt>Control plane</dt><dd>Dimaag: <b>API server</b> (sab usi se baat karte hain, <code>kubectl</code> command samet), <b>etcd</b> (cluster state rakhne wala key-value database), <b>scheduler</b> aur <b>controllers</b> jo desired aur actual state compare karte hain.</dd>
<dt>Worker node</dt><dd>Workloads chalane wali machine. Har ek mein container runtime, containers start aur watch karne wala <b>kubelet</b> agent, aur services ke liye forwarding rules program karne wala <b>kube-proxy</b> hota hai.</dd>
<dt>Pod</dt><dd>Sabse chhoti unit jo Kubernetes schedule karta hai: ek ya zyada containers jo <b>ek IP address</b> share karte hain aur hamesha saath rakhe jaate hain.</dd>
<dt>Deployment</dt><dd>Declare karta hai ki pod ki kitni replicas chalni chahiye aur kaunsa image version; scaling aur rolling updates handle karta hai.</dd>
<dt>Service</dt><dd>Badalte pods ke set ke saamne ek stable virtual IP aur DNS naam, built-in load balancing ke saath.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Kubernetes cluster">
<rect x="220" y="14" width="200" height="56" rx="8" fill="#fed7aa"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">API server, etcd, scheduler</text>
<line x1="260" y1="70" x2="160" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="380" y1="70" x2="480" y2="110" stroke="#64748b" stroke-width="1.5"/>
<rect x="40" y="110" width="240" height="110" rx="8" fill="#bae6fd"/><text x="160" y="130" text-anchor="middle" class="svg-ink" font-size="13">worker1 (ek VM)</text>
<rect x="56" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="104" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="104" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.1.12</text>
<rect x="168" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="216" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod api</text><text x="216" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.1.13</text>
<text x="160" y="206" text-anchor="middle" class="svg-muted" font-size="12">kubelet, kube-proxy</text>
<rect x="360" y="110" width="240" height="110" rx="8" fill="#bae6fd"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="13">worker2 (ek VM)</text>
<rect x="376" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="424" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="424" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.2.7</text>
<rect x="488" y="142" width="96" height="40" rx="6" fill="#bbf7d0"/><text x="536" y="160" text-anchor="middle" class="svg-ink" font-size="12">pod web</text><text x="536" y="175" text-anchor="middle" class="svg-muted" font-size="12">10.244.2.8</text>
<text x="480" y="206" text-anchor="middle" class="svg-muted" font-size="12">kubelet, kube-proxy</text>
<rect x="170" y="238" width="300" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="259" text-anchor="middle" class="svg-ink" font-size="12">Service web: 10.96.120.15, ek stable IP</text>
</svg><p class="cap">Har node par pods ko apne IPs milte hain; service teen web pods ko ek stable address deti hai.</p></div>

<h3>Chaar rules mein Kubernetes networking</h3>
<ol>
<li>Har pod ko pod network se <b>apna IP address</b> milta hai (jaise 10.244.0.0/16, per-node slice jaise 10.244.1.0/24).</li>
<li>Har pod kisi bhi node par har doosre pod tak <b>bina NAT</b> pahunch sakta hai.</li>
<li>Pod network ek <b>CNI plugin</b> (Container Network Interface) banata hai, jaise Calico, Flannel ya Cilium. Kuch pod subnets ko BGP se physical network par route karte hain; kuch nodes ke beech overlay tunnels (VXLAN) banate hain.</li>
<li><b>Services</b> stable access dete hain: <b>ClusterIP</b> (sirf internal virtual IP), <b>NodePort</b> (har node par 30000-32767 range ka ek port khulta hai), aur <b>LoadBalancer</b> (cloud ya on-premises load balancer se external IP maangta hai).</li>
</ol>

<pre class="out">$ kubectl get pods -o wide
NAME                   READY   STATUS    RESTARTS   AGE   IP            NODE
web-7c9d8f6b5-4xkqz    1/1     Running   0          2m    <span class="hl">10.244.1.12</span>   worker1
web-7c9d8f6b5-m2p8d    1/1     Running   0          2m    10.244.2.7    worker2
web-7c9d8f6b5-t9wzc    1/1     Running   0          2m    10.244.2.8    worker2

$ kubectl get svc web
NAME   TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
<span class="hl">web    NodePort   10.96.120.15   &lt;none&gt;        80:30080/TCP   2m</span></pre>

<div class="eg"><p><b>Worked example.</b> Deployment 3 web replicas maangta hai. worker1 crash hota hai, aur pod 10.244.1.12 bhi saath le jaata hai. Seconds mein controller dekhta hai ki 3 ki jagah 2 chal rahe hain, aur scheduler worker2 par naye IP ke saath naya pod start karta hai, maan lo 10.244.2.9. Clients ko pata bhi nahi chala, kyunki woh service 10.96.120.15 se (ya kisi bhi node ke port 30080 se) baat karte hain, aur service ki backend list apne aap update ho gayi.</p></div>

<div class="warn"><p><b>Common galti.</b> Firewall rule ya application setting mein pod IP hard-code karna. Pods disposable hain aur har baar dobara banne par IP badalte hain. Service ki taraf point karo, ya poori pod range permit karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA sirf concept expect karta hai: Kubernetes ek <b>container orchestrator</b> hai jo cluster par containers ko schedule, scale aur heal karta hai. Yeh hypervisor nahi hai aur container engine bhi nahi; yeh neeche containerd jaisa runtime use karta hai.</p></div>

<div class="scn"><h4>Pod range jise kisi ne route nahi kiya</h4><p>Ek team ne aise CNI plugin ke saath Kubernetes cluster install kiya jo pod subnets ko BGP se data center switches ko advertise karta hai. Pods aapas mein pahunch rahe the, par database VLAN tak nahi. Leaf switches par nodes ke saath koi BGP peering configured nahi thi, isliye unke paas 10.244.0.0/16 ka wapas ka route nahi tha. Peering jodne se (ya, alternative mein, nodes par SNAT se) theek ho gaya.</p><p><b>Seekh:</b> Kubernetes aapke network mein nayi IP ranges jodta hai. Kisi bhi doosre subnet ki tarah plan karo ki woh kaise route ya translate hongi.</p></div>

<div class="iv"><p class="q">"Kubernetes kya hai, aur company ise kyun use karegi?"</p><p>Kubernetes open-source container orchestrator hai. Aap desired state declare karte ho aur yeh nodes ke cluster par pods schedule karta hai, fail hue pods restart karta hai, replicas scale karta hai aur rolling updates karta hai. Pieces ke naam lo: control plane (API server, etcd, scheduler), worker nodes (kubelet, kube-proxy, runtime), pods, deployments aur services. Network view se, har pod ko CNI plugin se apna IP milta hai, aur services stable virtual IPs deti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kubernetes containers ko orchestrate karta hai: scheduling, self-healing, scaling, rolling updates aur service discovery.</li>
<li>Control plane = API server, etcd, scheduler, controllers; worker nodes kubelet, kube-proxy aur container runtime chalate hain.</li>
<li>Pod ek IP share karne wale ek ya zyada containers hain; deployment N replicas chalu rakhta hai.</li>
<li>Har pod ko CNI plugin se routable IP milta hai aur woh bina NAT doosre pods tak pahunchta hai.</li>
<li>Services (ClusterIP, NodePort 30000-32767, LoadBalancer) badalte pods tak stable access dete hain.</li>
</ul></div>
`}};export{e as default};