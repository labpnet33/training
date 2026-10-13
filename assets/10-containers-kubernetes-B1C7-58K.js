var e={id:`containers-k8s`,h:{en:`Container and Kubernetes security (concept level)`,hi:`Container aur Kubernetes security (concept level)`},body:{en:`
<p>A virtual machine is like a separate house: its own walls, its own plumbing, its own front door. A <b>container</b> is like a flat in an apartment block: each flat has its own locked door and furniture, but all flats share the building's foundation, pipes and wiring. Containers share the host's <b>kernel</b>. That makes them light and fast, and it also means a flat whose tenant breaks through the wall can reach the shared pipes. <b>Kubernetes</b> is the building management company that decides which flat goes on which floor, restarts tenants who fall ill and connects everyone to the lift.</p>

<h3>Containers in four sentences</h3>
<p>An <b>image</b> is a read-only package of an application plus its libraries, built from a Dockerfile in layers. A <b>registry</b> stores images. A <b>container</b> is a running instance of an image, isolated by Linux <b>namespaces</b> (what it can see) and <b>cgroups</b> (how much CPU and memory it may use). Because the kernel is shared, a container running as root with extra privileges is much closer to the host than a VM is.</p>

<h3>Securing the image</h3>
<ul>
<li>Start from a <b>minimal, trusted base image</b> (distroless or slim), pinned by digest.</li>
<li><b>Scan</b> images for CVEs and secrets in the pipeline and again in the registry, because new CVEs appear after the build.</li>
<li>Run as a <b>non-root user</b>, drop Linux capabilities, use a <b>read-only root file system</b>.</li>
<li><b>Sign</b> images and only allow signed images from your registry to run.</li>
</ul>

<h3>Kubernetes building blocks</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Kubernetes architecture">
<rect x="10" y="10" width="250" height="210" rx="8" fill="#ddd6fe"/><text x="135" y="32" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text>
<rect x="25" y="45" width="220" height="38" rx="6" fill="#fde68a"/><text x="135" y="69" text-anchor="middle" class="svg-ink" font-size="12">API server (RBAC, admission)</text>
<rect x="25" y="92" width="220" height="38" rx="6" fill="#fed7aa"/><text x="135" y="116" text-anchor="middle" class="svg-ink" font-size="12">etcd (cluster state, secrets)</text>
<rect x="25" y="139" width="220" height="38" rx="6" fill="#e2e8f0"/><text x="135" y="163" text-anchor="middle" class="svg-ink" font-size="12">scheduler, controllers</text>
<rect x="300" y="10" width="330" height="210" rx="8" fill="#bae6fd"/><text x="465" y="32" text-anchor="middle" class="svg-ink" font-size="13">Worker nodes</text>
<rect x="315" y="45" width="140" height="80" rx="6" fill="#bbf7d0"/><text x="385" y="70" text-anchor="middle" class="svg-ink" font-size="12">ns: payments</text><text x="385" y="92" text-anchor="middle" class="svg-muted" font-size="12">pods web, api</text>
<rect x="475" y="45" width="140" height="80" rx="6" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="12">ns: reporting</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">pods etl</text>
<rect x="315" y="140" width="300" height="38" rx="6" fill="#e2e8f0"/><text x="465" y="164" text-anchor="middle" class="svg-ink" font-size="12">kubelet, CNI (network policy)</text>
<line x1="260" y1="64" x2="300" y2="64" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The API server is the front door of the cluster; every change passes through authentication, RBAC and admission control.</p></div>

<h3>The Kubernetes security checklist</h3>
<ul>
<li><b>Protect the API server and etcd</b>: no public API endpoint (or restrict it by source range), TLS everywhere, etcd encrypted and reachable only from the control plane.</li>
<li><b>RBAC with least privilege</b>: Roles and RoleBindings per namespace; avoid cluster-admin for people and for service accounts.</li>
<li><b>Namespaces</b> to separate teams and applications, with quotas.</li>
<li><b>Network policies</b>: by default every pod can reach every pod. Start each namespace with <b>default deny</b> and allow only what is needed.</li>
<li><b>Pod Security Standards</b> (Privileged, Baseline, Restricted) enforced by the built-in Pod Security Admission: no privileged pods, no host networking, non-root.</li>
<li><b>Admission control</b>: a policy engine rejects pods from unsigned images, images with critical CVEs, or containers without resource limits.</li>
<li><b>Secrets</b>: Kubernetes Secrets are only base64-encoded by default; enable encryption at rest or use an external secrets manager.</li>
<li><b>Runtime and audit</b>: runtime security (for example eBPF-based Tetragon) and the Kubernetes audit log into the SIEM.</li>
</ul>

<pre class="code"><span class="c"># Default deny all ingress and egress in namespace payments</span>
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: payments
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
<span class="c"># Allow only web pods to reach api pods on 8443</span>
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: payments
spec:
  podSelector: { matchLabels: { app: api } }
  ingress:
  - from: [ { podSelector: { matchLabels: { app: web } } } ]
    ports: [ { protocol: TCP, port: 8443 } ]
<span class="c"># Enforce the Restricted Pod Security Standard on the namespace</span>
kubectl label namespace payments pod-security.kubernetes.io/enforce=restricted</pre>
<pre class="out">$ kubectl get networkpolicy -n payments
NAME               POD-SELECTOR   AGE
<span class="hl">default-deny-all   &lt;none&gt;         2d</span>
allow-web-to-api   app=api        2d</pre>

<div class="eg"><p><b>Worked example.</b> A namespace has 3 apps (web, api, db) with 4 pods each. Without network policies, each of the 12 pods can reach the other 11: 132 possible pod-to-pod paths. With default deny plus two allow rules (web to api on 8443, api to db on 5432) and a DNS egress rule, the real paths drop to 32 (4 x 4 + 4 x 4), and the web pods can no longer reach the database at all.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Applying default deny egress and forgetting DNS (UDP/TCP 53 to the cluster DNS), so every pod fails name resolution. Writing network policies on a cluster whose CNI does not enforce them. Treating base64 Secrets as encrypted.</p></div>
<div class="exam"><p><b>Exam traps.</b> Network policy = which pods may talk to which. RBAC = who may do what through the API. Pod Security Standards = what a pod may do on the node. Admission control = what is allowed into the cluster. Containers share the host kernel; VMs do not.</p></div>

<div class="scn"><h4>The dashboard that ran as cluster-admin</h4><p>A team installed a management dashboard in their cluster with a service account bound to cluster-admin, and exposed it through a public load balancer "for a demo". Someone found it, used it to start a privileged pod mounting the host file system and installed a cryptominer on every node. The fixes: remove the public exposure, rebind the dashboard to a read-only role, enforce the Restricted Pod Security Standard on application namespaces, add an admission policy that blocks privileged pods and host mounts, and send the Kubernetes audit log to the SIEM with an alert on new ClusterRoleBindings.</p><p><b>Lesson:</b> in Kubernetes, the API server and RBAC are the crown jewels. Over-privileged service accounts are the cloud IAM problem again, one layer down.</p></div>

<div class="iv"><p class="q">"How do you secure a Kubernetes cluster at a high level?"</p><p>Go layer by layer: control plane (private API server, TLS, encrypted etcd, audit logging); identity (RBAC least privilege, no cluster-admin service accounts); workloads (signed, scanned images, non-root, Pod Security Standards via admission); network (default-deny network policies, mTLS with a service mesh where needed); secrets (encryption at rest or an external vault); runtime (eBPF-based detection) and logs into the SIEM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Containers share the host kernel, so privileges and root matter more than in VMs.</li>
<li>Secure images: minimal base, scanned, non-root, signed.</li>
<li>Protect the API server and etcd; RBAC with least privilege.</li>
<li>Network policies with default deny; remember DNS egress.</li>
<li>Pod Security Standards and admission control decide what may run.</li>
</ul></div>
`,hi:`
<p>Virtual machine ek alag ghar jaisa hai: apni deewarein, apni plumbing, apna front door. <b>Container</b> apartment block ke ek flat jaisa hai: har flat ka apna locked darwaza aur furniture hai, lekin saare flats building ki foundation, pipes aur wiring share karte hain. Containers host ka <b>kernel</b> share karte hain. Isse woh halke aur fast hote hain, aur iska matlab yeh bhi hai ki jo tenant deewar tod de woh shared pipes tak pahunch sakta hai. <b>Kubernetes</b> building management company hai jo decide karti hai kaunsa flat kis floor par jaayega, beemar tenants ko restart karti hai aur sabko lift se jodti hai.</p>

<h3>Chaar sentences mein containers</h3>
<p><b>Image</b> application aur uski libraries ka read-only package hai, Dockerfile se layers mein bana. <b>Registry</b> images store karti hai. <b>Container</b> image ka chalta hua instance hai, Linux <b>namespaces</b> (kya dekh sakta hai) aur <b>cgroups</b> (kitna CPU aur memory use kar sakta hai) se isolated. Kyunki kernel shared hai, extra privileges ke saath root chalata container VM ke comparison mein host ke kahin zyada kareeb hai.</p>

<h3>Image ko secure karna</h3>
<ul>
<li><b>Minimal, trusted base image</b> (distroless ya slim) se shuru karo, digest se pinned.</li>
<li>Pipeline mein aur dobara registry mein images ko CVEs aur secrets ke liye <b>scan</b> karo, kyunki build ke baad naye CVEs aate hain.</li>
<li><b>Non-root user</b> ke roop mein chalao, Linux capabilities drop karo, <b>read-only root file system</b> use karo.</li>
<li>Images <b>sign</b> karo aur sirf apni registry ki signed images ko chalne do.</li>
</ul>

<h3>Kubernetes ke building blocks</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Kubernetes architecture">
<rect x="10" y="10" width="250" height="210" rx="8" fill="#ddd6fe"/><text x="135" y="32" text-anchor="middle" class="svg-ink" font-size="13">Control plane</text>
<rect x="25" y="45" width="220" height="38" rx="6" fill="#fde68a"/><text x="135" y="69" text-anchor="middle" class="svg-ink" font-size="12">API server (RBAC, admission)</text>
<rect x="25" y="92" width="220" height="38" rx="6" fill="#fed7aa"/><text x="135" y="116" text-anchor="middle" class="svg-ink" font-size="12">etcd (cluster state, secrets)</text>
<rect x="25" y="139" width="220" height="38" rx="6" fill="#e2e8f0"/><text x="135" y="163" text-anchor="middle" class="svg-ink" font-size="12">scheduler, controllers</text>
<rect x="300" y="10" width="330" height="210" rx="8" fill="#bae6fd"/><text x="465" y="32" text-anchor="middle" class="svg-ink" font-size="13">Worker nodes</text>
<rect x="315" y="45" width="140" height="80" rx="6" fill="#bbf7d0"/><text x="385" y="70" text-anchor="middle" class="svg-ink" font-size="12">ns: payments</text><text x="385" y="92" text-anchor="middle" class="svg-muted" font-size="12">pods web, api</text>
<rect x="475" y="45" width="140" height="80" rx="6" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="12">ns: reporting</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">pods etl</text>
<rect x="315" y="140" width="300" height="38" rx="6" fill="#e2e8f0"/><text x="465" y="164" text-anchor="middle" class="svg-ink" font-size="12">kubelet, CNI (network policy)</text>
<line x1="260" y1="64" x2="300" y2="64" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">API server cluster ka front door hai; har change authentication, RBAC aur admission control se hokar guzarta hai.</p></div>

<h3>Kubernetes security checklist</h3>
<ul>
<li><b>API server aur etcd protect karo</b>: koi public API endpoint nahi (ya source range se restrict karo), har jagah TLS, etcd encrypted aur sirf control plane se reachable.</li>
<li><b>Least privilege ke saath RBAC</b>: har namespace ke liye Roles aur RoleBindings; logon aur service accounts ke liye cluster-admin se bacho.</li>
<li>Teams aur applications ko alag karne ke liye <b>namespaces</b>, quotas ke saath.</li>
<li><b>Network policies</b>: default mein har pod har pod tak pahunch sakta hai. Har namespace ko <b>default deny</b> se shuru karo aur sirf zaroori cheezein allow karo.</li>
<li>Built-in Pod Security Admission se enforce hue <b>Pod Security Standards</b> (Privileged, Baseline, Restricted): privileged pods nahi, host networking nahi, non-root.</li>
<li><b>Admission control</b>: policy engine unsigned images, critical CVEs wali images, ya bina resource limits wale containers ke pods reject karta hai.</li>
<li><b>Secrets</b>: Kubernetes Secrets default mein sirf base64-encoded hote hain; encryption at rest on karo ya external secrets manager use karo.</li>
<li><b>Runtime aur audit</b>: runtime security (jaise eBPF-based Tetragon) aur Kubernetes audit log SIEM mein.</li>
</ul>

<pre class="code"><span class="c"># Namespace payments mein saara ingress aur egress default deny</span>
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: payments
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
<span class="c"># Sirf web pods ko api pods tak 8443 par jaane do</span>
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: payments
spec:
  podSelector: { matchLabels: { app: api } }
  ingress:
  - from: [ { podSelector: { matchLabels: { app: web } } } ]
    ports: [ { protocol: TCP, port: 8443 } ]
<span class="c"># Namespace par Restricted Pod Security Standard enforce karo</span>
kubectl label namespace payments pod-security.kubernetes.io/enforce=restricted</pre>
<pre class="out">$ kubectl get networkpolicy -n payments
NAME               POD-SELECTOR   AGE
<span class="hl">default-deny-all   &lt;none&gt;         2d</span>
allow-web-to-api   app=api        2d</pre>

<div class="eg"><p><b>Worked example.</b> Ek namespace mein 3 apps (web, api, db) hain, har ek ke 4 pods. Network policies ke bina 12 pods mein se har ek baaki 11 tak pahunch sakta hai: 132 possible pod-to-pod paths. Default deny plus do allow rules (web se api 8443 par, api se db 5432 par) aur ek DNS egress rule ke saath asli paths 32 (4 x 4 + 4 x 4) reh jaate hain, aur web pods database tak bilkul nahi pahunch sakte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Default deny egress lagana aur DNS bhool jaana (cluster DNS tak UDP/TCP 53), jisse har pod ka name resolution fail ho jaata hai. Aise cluster par network policies likhna jiska CNI unhe enforce hi nahi karta. Base64 Secrets ko encrypted samajhna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Network policy = kaunse pods kis se baat kar sakte hain. RBAC = API ke through kaun kya kar sakta hai. Pod Security Standards = pod node par kya kar sakta hai. Admission control = cluster mein kya aane diya jaaye. Containers host kernel share karte hain; VMs nahi.</p></div>

<div class="scn"><h4>Woh dashboard jo cluster-admin ke roop mein chalta tha</h4><p>Ek team ne apne cluster mein management dashboard install kiya, jiska service account cluster-admin se bound tha, aur use "demo ke liye" public load balancer se expose kar diya. Kisi ne use dhoondh liya, uske through host file system mount karne wala privileged pod start kiya aur har node par cryptominer install kar diya. Fixes: public exposure hatao, dashboard ko read-only role se rebind karo, application namespaces par Restricted Pod Security Standard enforce karo, privileged pods aur host mounts block karne wali admission policy jodo, aur naye ClusterRoleBindings par alert ke saath Kubernetes audit log SIEM ko bhejo.</p><p><b>Seekh:</b> Kubernetes mein API server aur RBAC crown jewels hain. Over-privileged service accounts wahi cloud IAM problem hai, ek layer neeche.</p></div>

<div class="iv"><p class="q">"High level par Kubernetes cluster kaise secure karoge?"</p><p>Layer by layer chalo: control plane (private API server, TLS, encrypted etcd, audit logging); identity (RBAC least privilege, cluster-admin service accounts nahi); workloads (signed, scanned images, non-root, admission ke through Pod Security Standards); network (default-deny network policies, zaroorat ho to service mesh se mTLS); secrets (encryption at rest ya external vault); runtime (eBPF-based detection) aur logs SIEM mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Containers host kernel share karte hain, isliye privileges aur root VMs se zyada matter karte hain.</li>
<li>Images secure karo: minimal base, scanned, non-root, signed.</li>
<li>API server aur etcd protect karo; least privilege ke saath RBAC.</li>
<li>Default deny wali network policies; DNS egress yaad rakho.</li>
<li>Pod Security Standards aur admission control decide karte hain ki kya chal sakta hai.</li>
</ul></div>
`}};export{e as default};