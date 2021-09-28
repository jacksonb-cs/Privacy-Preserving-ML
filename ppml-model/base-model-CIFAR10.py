import torch
import torch.nn as nn
import torch.nn.functional as F

import torchvision
import torchvision.transforms as transforms

transform = transforms.Compose(
	[transforms.ToTensor(),
	 transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))]
)

batch_size = 4

trainset = torchvision.datasets.CIFAR10(
	root='./data',
	train=True,
	download=True,
	transform=transform
)

trainloader = torch.utils.data.DataLoader(
	trainset,
	batch_size=batch_size,
	shuffle=True,
	num_workers=0
)

testset = torchvision.datasets.CIFAR10(
	root='./data',
	train=False,
	download=True,
	transform=transform
)

testloader = torch.utils.data.DataLoader(
	testset,
	batch_size=batch_size,
	shuffle=False,
	num_workers=0
)

classes = ('plane', 'car', 'bird', 'cat', 'deer',
			'dog', 'frog', 'horse', 'ship', 'truck')


class CNN(nn.Module):
	
	def __init__(self):

		super().__init__()
		self.conv1 = nn.Conv2d(3, 6, 5)
		self.pool = nn.MaxPool2d(2, 2)
		self.conv2 = nn.Conv2d(6, 16, 5)
		self.fc1 = nn.Linear(16 * 5 * 5, 120)
		self.fc2 = nn.Linear(120, 84)
		self.fc3 = nn.Linear(84, 10)

	def forward(self, x):
		
		x = self.pool(F.relu(self.conv1(x)))
		x = self.pool(F.relu(self.conv2(x)))
		x = torch.flatten(x, 1) # flatten all dimensions except batch
		x = F.relu(self.fc1(x))
		x = F.relu(self.fc2(x))
		x = self.fc3(x)

		return x


cnn = CNN()


