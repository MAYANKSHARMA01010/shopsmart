# ==========================================
# EKS Cluster (data source - already exists)
# ==========================================

data "aws_eks_cluster" "shopsmart_eks" {
  name = "${var.project_name}-eks-cluster"
}

# ==========================================
# EKS Node Group (data source - already exists)
# ==========================================

data "aws_eks_node_group" "shopsmart_nodes" {
  cluster_name    = data.aws_eks_cluster.shopsmart_eks.name
  node_group_name = "${var.project_name}-node-group"
}
